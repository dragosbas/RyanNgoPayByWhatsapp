import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";

const root = process.cwd();
const bundle = path.join(root, "deploy-bundle");
const zipPath = path.join(root, "goodfund.zip");

const standaloneDir = path.join(root, ".next", "standalone");
if (!existsSync(path.join(standaloneDir, "server.js"))) {
  console.error("Missing .next/standalone/server.js. Run npm run build first.");
  process.exit(1);
}

rmSync(bundle, { recursive: true, force: true });
mkdirSync(bundle, { recursive: true });

function replaceDir(src, dest) {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true, dereference: true });
}

cpSync(standaloneDir, bundle, { recursive: true, dereference: true });
replaceDir(path.join(root, ".next", "static"), path.join(bundle, ".next", "static"));
replaceDir(path.join(root, "public"), path.join(bundle, "public"));
replaceDir(path.join(root, "prisma"), path.join(bundle, "prisma"));

// Startup runs `node node_modules/prisma/build/index.js migrate deploy`.
// Copy that CLI and every package it requires. Dev dependencies of the app
// (TypeScript, Vitest, Playwright) stay out of the zip.
const seen = new Set();

function packageDir(name, fromDir) {
  let dir = fromDir;
  while (true) {
    const candidate = path.join(dir, "node_modules", name);
    if (existsSync(path.join(candidate, "package.json"))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`Cannot find ${name} from ${fromDir}`);
}

function walk(name, fromDir, optional) {
  let dir;
  try {
    dir = packageDir(name, fromDir);
  } catch (error) {
    if (optional) return;
    throw error;
  }
  if (seen.has(dir)) return;
  seen.add(dir);
  const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"));
  for (const dep of Object.keys(pkg.dependencies ?? {})) {
    walk(dep, dir, false);
  }
  for (const dep of Object.keys(pkg.optionalDependencies ?? {})) {
    walk(dep, dir, true);
  }
}

walk("prisma", root, false);

const rootModules = path.join(root, "node_modules");
for (const dir of seen) {
  const rel = path.relative(rootModules, dir);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Prisma dependency is outside node_modules: ${dir}`);
  }
  replaceDir(dir, path.join(bundle, "node_modules", rel));
}

const schemaEngine = path.join(
  bundle,
  "node_modules",
  "@prisma",
  "engines",
  "schema-engine-debian-openssl-3.0.x",
);
const queryEngineName = "libquery_engine-debian-openssl-3.0.x.so.node";

function findNamed(dir, fileName) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findNamed(full, fileName);
      if (found) return found;
    } else if (entry.name === fileName) {
      return full;
    }
  }
  return null;
}

const queryEngine = findNamed(bundle, queryEngineName);
const required = [
  path.join(bundle, "server.js"),
  path.join(bundle, "node_modules", "prisma", "build", "index.js"),
  path.join(bundle, "prisma", "schema.prisma"),
  path.join(bundle, "prisma", "migrations"),
  path.join(bundle, ".next", "static"),
  path.join(bundle, "public"),
  schemaEngine,
];

for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Package is missing ${path.relative(bundle, file)}`);
    process.exit(1);
  }
}
if (!queryEngine) {
  console.error(`Package is missing ${queryEngineName}`);
  process.exit(1);
}
if (statSync(schemaEngine).size < 1_000_000) {
  console.error("Schema engine looks truncated.");
  process.exit(1);
}

rmSync(zipPath, { force: true });
const zip = spawnSync("zip", ["-r", "-q", zipPath, "."], {
  cwd: bundle,
  stdio: "inherit",
});
if (zip.status !== 0) {
  process.exit(zip.status ?? 1);
}

const bytes = statSync(zipPath).size;
console.log(
  `Wrote ${zipPath} (${(bytes / (1024 * 1024)).toFixed(1)} MiB)`,
);
console.log(`Query engine: ${path.relative(bundle, queryEngine)}`);
