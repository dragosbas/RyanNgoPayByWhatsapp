import { normalizeToE164 } from "@/lib/phone";
import type { RateLimiter } from "@/lib/rate-limit";
import {
  recordConsent,
  recordOptOut,
  type SubscriberStore,
} from "@/lib/subscribers";

export type FieldErrors = {
  phone?: "invalid_phone";
  consent?: "consent_required";
};

export type SignupResult =
  | { ok: true }
  | { ok: false; error: "rate_limited" }
  | { ok: false; fields: FieldErrors };

export type SignupDeps = {
  store: SubscriberStore;
  rateLimit: RateLimiter;
  now: () => Date;
  consentVersion: string;
};

export async function handleSubscribe(
  deps: SignupDeps,
  input: {
    phone: string;
    consent: boolean;
    honeypot: string;
    ip: string;
  },
): Promise<SignupResult> {
  const limit = deps.rateLimit.consume(`subscribe:${input.ip}`);
  if (!limit.ok) return { ok: false, error: "rate_limited" };

  // Bots that fill the hidden field get the same success shape and no write.
  if (input.honeypot.trim() !== "") return { ok: true };

  const fields: FieldErrors = {};
  const phone = normalizeToE164(input.phone);
  if (!input.consent) fields.consent = "consent_required";
  if (!phone) fields.phone = "invalid_phone";
  if (!phone || !input.consent) return { ok: false, fields };

  await recordConsent(deps.store, {
    phone,
    consentTextVersion: deps.consentVersion,
    now: deps.now(),
  });

  return { ok: true };
}

export async function handleUnsubscribe(
  deps: Pick<SignupDeps, "store" | "rateLimit" | "now">,
  input: { phone: string; honeypot: string; ip: string },
): Promise<SignupResult> {
  const limit = deps.rateLimit.consume(`unsubscribe:${input.ip}`);
  if (!limit.ok) return { ok: false, error: "rate_limited" };

  if (input.honeypot.trim() !== "") return { ok: true };

  const phone = normalizeToE164(input.phone);
  if (!phone) return { ok: false, fields: { phone: "invalid_phone" } };

  // Missing numbers still look successful, so the page does not reveal who is listed.
  await recordOptOut(deps.store, { phone, now: deps.now() });
  return { ok: true };
}
