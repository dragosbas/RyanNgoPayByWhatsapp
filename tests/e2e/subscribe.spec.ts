import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { copy } from "../../content/copy";

const prisma = new PrismaClient();
const primary = "+40722123456";
const honeypotPhone = "+40723123456";

test.beforeAll(async () => {
  await prisma.subscriber.deleteMany({
    where: { phone: { in: [primary, honeypotPhone] } },
  });
});

test.afterAll(async () => {
  await prisma.subscriber.deleteMany({
    where: { phone: { in: [primary, honeypotPhone] } },
  });
  await prisma.$disconnect();
});

test("signup is idempotent against Postgres and unsubscribe opts out", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: copy.home.headline })).toBeVisible();
  await expect(page.getByRole("checkbox")).not.toBeChecked();

  await page.locator("form").evaluate((form) => {
    (form as HTMLFormElement).noValidate = true;
  });
  const main = page.locator("main");
  await page.getByLabel(copy.form.phoneLabel).fill("0722 123 456");
  await page.getByRole("button", { name: copy.form.submit }).click();
  await expect(main.getByRole("alert")).toContainText(copy.errors.consent_required);
  expect(await prisma.subscriber.findUnique({ where: { phone: primary } })).toBeNull();

  await page.getByLabel(copy.form.phoneLabel).fill("123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: copy.form.submit }).click();
  await expect(main.getByRole("alert")).toContainText(copy.errors.invalid_phone);
  expect(await prisma.subscriber.findUnique({ where: { phone: primary } })).toBeNull();

  await page.locator('input[name="website"]').fill("https://spam.example");
  await page.getByLabel(copy.form.phoneLabel).fill("0723 123 456");
  await page.getByRole("button", { name: copy.form.submit }).click();
  await expect(main.getByRole("status")).toContainText(copy.home.success);
  expect(
    await prisma.subscriber.findUnique({ where: { phone: honeypotPhone } }),
  ).toBeNull();

  await page.goto("/");
  await page.getByLabel(copy.form.phoneLabel).fill("0722 123 456");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: copy.form.submit }).click();
  await expect(main.getByRole("status")).toContainText(copy.home.success);

  const created = await prisma.subscriber.findUnique({ where: { phone: primary } });
  expect(created).not.toBeNull();
  expect(created?.optedOutAt).toBeNull();
  expect(created?.consentTextVersion).toBe(copy.consent.version);

  await page.goto("/");
  await page.getByLabel(copy.form.phoneLabel).fill("+40 722 123 456");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: copy.form.submit }).click();
  await expect(main.getByRole("status")).toBeVisible();

  const resigned = await prisma.subscriber.findUnique({ where: { phone: primary } });
  expect(await prisma.subscriber.count({ where: { phone: primary } })).toBe(1);
  expect(resigned?.id).toBe(created?.id);
  expect(resigned?.createdAt.toISOString()).toBe(created?.createdAt.toISOString());
  expect(resigned!.consentAt.getTime()).toBeGreaterThanOrEqual(
    created!.consentAt.getTime(),
  );

  await page.goto("/unsubscribe");
  await page.getByLabel(copy.form.phoneLabel).fill("0722 123 456");
  await page.getByRole("button", { name: copy.unsubscribe.submit }).click();
  await expect(main.getByRole("status")).toContainText(copy.unsubscribe.success);
  const optedOut = await prisma.subscriber.findUnique({ where: { phone: primary } });
  expect(optedOut?.optedOutAt).not.toBeNull();

  await page.goto("/unsubscribe");
  await page.getByLabel(copy.form.phoneLabel).fill("0722123456");
  await page.getByRole("button", { name: copy.unsubscribe.submit }).click();
  await expect(main.getByRole("status")).toBeVisible();
  const optedOutAgain = await prisma.subscriber.findUnique({
    where: { phone: primary },
  });
  expect(optedOutAgain?.optedOutAt?.toISOString()).toBe(
    optedOut?.optedOutAt?.toISOString(),
  );

  await page.goto("/");
  await page.getByLabel(copy.form.phoneLabel).fill("0722 123 456");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: copy.form.submit }).click();
  await expect(main.getByRole("status")).toBeVisible();
  const restored = await prisma.subscriber.findUnique({ where: { phone: primary } });
  expect(restored?.id).toBe(created?.id);
  expect(restored?.optedOutAt).toBeNull();

  await page.goto("/confidentialitate");
  await expect(page.getByRole("heading", { name: copy.privacy.title })).toBeVisible();
  await page.goto("/privacy");
  await expect(page).toHaveURL(/\/confidentialitate$/);
});
