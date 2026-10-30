import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";
import { handleSubscribe, handleUnsubscribe } from "@/lib/signup";
import { createMemoryStore } from "@/lib/subscribers";

const version = "2026-10-30";

function setup(limit = 5) {
  const store = createMemoryStore();
  const rateLimit = createRateLimiter({ limit, windowMs: 60_000 });
  let clock = new Date("2026-10-30T09:00:00Z");
  const deps = {
    store,
    rateLimit,
    now: () => clock,
    consentVersion: version,
  };
  return {
    store,
    deps,
    advance(ms: number) {
      clock = new Date(clock.getTime() + ms);
    },
  };
}

describe("handleSubscribe", () => {
  it("requires consent and a valid phone before writing", async () => {
    const { store, deps } = setup();
    const result = await handleSubscribe(deps, {
      phone: "123",
      consent: false,
      honeypot: "",
      ip: "1.1.1.1",
    });

    expect(result).toEqual({
      ok: false,
      fields: { phone: "invalid_phone", consent: "consent_required" },
    });
    expect(store.all()).toHaveLength(0);
  });

  it("stores an E.164 number with the consent version", async () => {
    const { store, deps } = setup();
    const result = await handleSubscribe(deps, {
      phone: "0722 123 456",
      consent: true,
      honeypot: "",
      ip: "1.1.1.1",
    });

    expect(result).toEqual({ ok: true });
    expect(store.all()).toEqual([
      expect.objectContaining({
        phone: "+40722123456",
        consentTextVersion: version,
        optedOutAt: null,
      }),
    ]);
  });

  it("does not create a second row when the same number signs up again", async () => {
    const { store, deps, advance } = setup();
    await handleSubscribe(deps, {
      phone: "0722123456",
      consent: true,
      honeypot: "",
      ip: "1.1.1.1",
    });
    const first = store.all()[0];
    advance(60_000);
    await handleUnsubscribe(
      { store, rateLimit: deps.rateLimit, now: deps.now },
      { phone: "+40 722 123 456", honeypot: "", ip: "1.1.1.1" },
    );
    advance(60_000);
    await handleSubscribe(deps, {
      phone: "+40722123456",
      consent: true,
      honeypot: "  ",
      ip: "1.1.1.1",
    });

    const rows = store.all();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(first?.id);
    expect(rows[0]?.createdAt).toEqual(first?.createdAt);
    expect(rows[0]?.optedOutAt).toBeNull();
    expect(rows[0]?.consentTextVersion).toBe(version);
  });

  it("pretends a honeypot submission succeeded and does not write", async () => {
    const { store, deps } = setup();
    const result = await handleSubscribe(deps, {
      phone: "0722123456",
      consent: true,
      honeypot: "https://spam.example",
      ip: "1.1.1.1",
    });
    expect(result).toEqual({ ok: true });
    expect(store.all()).toHaveLength(0);
  });

  it("rate limits by IP", async () => {
    const { deps } = setup(1);
    const first = await handleSubscribe(deps, {
      phone: "nope",
      consent: false,
      honeypot: "",
      ip: "203.0.113.8",
    });
    const second = await handleSubscribe(deps, {
      phone: "0722123456",
      consent: true,
      honeypot: "",
      ip: "203.0.113.8",
    });
    const otherIp = await handleSubscribe(deps, {
      phone: "0722123456",
      consent: true,
      honeypot: "",
      ip: "203.0.113.9",
    });

    expect(first.ok).toBe(false);
    expect(second).toEqual({ ok: false, error: "rate_limited" });
    expect(otherIp).toEqual({ ok: true });
  });
});

describe("handleUnsubscribe", () => {
  it("reports success for an unknown number without creating a row", async () => {
    const { store, deps } = setup();
    const result = await handleUnsubscribe(deps, {
      phone: "0722 123 456",
      honeypot: "",
      ip: "1.1.1.1",
    });
    expect(result).toEqual({ ok: true });
    expect(store.all()).toHaveLength(0);
  });

  it("opts out an existing number and ignores a repeated request", async () => {
    const { store, deps, advance } = setup();
    await handleSubscribe(deps, {
      phone: "0722123456",
      consent: true,
      honeypot: "",
      ip: "1.1.1.1",
    });
    advance(5_000);
    await handleUnsubscribe(deps, {
      phone: "0722 123 456",
      honeypot: "",
      ip: "1.1.1.1",
    });
    const optedOutAt = store.all()[0]?.optedOutAt;
    advance(5_000);
    const again = await handleUnsubscribe(deps, {
      phone: "+40722123456",
      honeypot: "",
      ip: "1.1.1.1",
    });

    expect(again).toEqual({ ok: true });
    expect(store.all()[0]?.optedOutAt).toEqual(optedOutAt);
  });

  it("rejects an invalid number", async () => {
    const { store, deps } = setup();
    const result = await handleUnsubscribe(deps, {
      phone: "123",
      honeypot: "",
      ip: "1.1.1.1",
    });
    expect(result).toEqual({ ok: false, fields: { phone: "invalid_phone" } });
    expect(store.all()).toHaveLength(0);
  });
});
