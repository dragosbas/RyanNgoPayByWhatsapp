/**
 * Azure App Service appends the client port to X-Forwarded-For
 * (`1.2.3.4:5678`, `[::1]:5678`). Rate limiting keys the IP only.
 */
function hostWithoutPort(value: string): string {
  const address = value.trim();
  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(address);
  if (bracketed?.[1]) return bracketed[1];
  const ipv4 = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/.exec(address);
  if (ipv4?.[1]) return ipv4[1];
  return address;
}

export function clientIpFromHeaders(
  get: (name: string) => string | null,
): string {
  const forwarded = get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return hostWithoutPort(first).slice(0, 64);
  }
  const real = get("x-real-ip")?.trim();
  if (real) return hostWithoutPort(real).slice(0, 64);
  return "unknown";
}
