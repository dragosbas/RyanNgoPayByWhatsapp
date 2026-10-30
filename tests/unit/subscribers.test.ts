import { describe, expect, it } from "vitest";
import {
  applyConsent,
  applyOptOut,
  createMemoryStore,
  recordConsent,
  recordOptOut,
  UniquePhoneError,
  type Subscriber,
  type SubscriberStore,
} from "@/lib/subscribers";

const phone = "+40722123456";

function row(overrides: Partial<Subscriber> = {}): Subscriber {
  return {
    id: "sub-1",
    phone,
    consentAt: new Date("2026-10-01T00:00:00Z"),
    consentTextVersion: "v0",
    optedOutAt: new Date("2026-10-15T00:00:00Z"),
    createdAt: new Date("2026-10-01T00:00:00Z"),
    ...overrides,
  };
}

describe("consent and opt-out transitions", () => {
  it("refreshes consent and clears opt-out without changing identity", () => {
    const existing = row();
    const now = new Date("2026-10-30T12:00:00Z");
    const next = applyConsent(existing, "2026-10-30", now);

    expect(next.id).toBe(existing.id);
    expect(next.createdAt).toEqual(existing.createdAt);
    expect(next.phone).toBe(existing.phone);
    expect(next.consentAt).toEqual(now);
    expect(next.consentTextVersion).toBe("2026-10-30");
    expect(next.optedOutAt).toBeNull();
  });

  it("stamps opt-out once and leaves the original time on a repeat", () => {
    const active = row({ optedOutAt: null });
    const firstAt = new Date("2026-10-20T08:00:00Z");
    const first = applyOptOut(active, firstAt);
    expect(first.changed).toBe(true);
    expect(first.subscriber.optedOutAt).toEqual(firstAt);

    const second = applyOptOut(first.subscriber, new Date("2026-10-21T08:00:00Z"));
    expect(second.changed).toBe(false);
    expect(second.subscriber.optedOutAt).toEqual(firstAt);
  });
});

describe("recordConsent", () => {
  it("creates one subscriber and treats a second signup as the same row", async () => {
    const store = createMemoryStore();
    const firstAt = new Date("2026-10-30T10:00:00Z");
    const created = await recordConsent(store, {
      phone,
      consentTextVersion: "v1",
      now: firstAt,
    });

    const secondAt = new Date("2026-10-30T11:00:00Z");
    const updated = await recordConsent(store, {
      phone,
      consentTextVersion: "v2",
      now: secondAt,
    });

    expect(store.all()).toHaveLength(1);
    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toEqual(firstAt);
    expect(updated.consentAt).toEqual(secondAt);
    expect(updated.consentTextVersion).toBe("v2");
    expect(updated.optedOutAt).toBeNull();
  });

  it("clears a previous opt-out when the same number signs up again", async () => {
    const store = createMemoryStore();
    await recordConsent(store, {
      phone,
      consentTextVersion: "v1",
      now: new Date("2026-10-30T10:00:00Z"),
    });
    await recordOptOut(store, {
      phone,
      now: new Date("2026-10-30T10:30:00Z"),
    });

    const again = await recordConsent(store, {
      phone,
      consentTextVersion: "v1",
      now: new Date("2026-10-30T11:00:00Z"),
    });

    expect(store.all()).toHaveLength(1);
    expect(again.optedOutAt).toBeNull();
  });

  it("keeps the row that won the insert race and refreshes its consent", async () => {
    const winner = row({ id: "winner", consentTextVersion: "old" });
    let visible: Subscriber | null = null;
    const store: SubscriberStore = {
      async findByPhone() {
        return visible
          ? {
              ...visible,
              consentAt: new Date(visible.consentAt),
              createdAt: new Date(visible.createdAt),
              optedOutAt: visible.optedOutAt
                ? new Date(visible.optedOutAt)
                : null,
            }
          : null;
      },
      async insert() {
        visible = { ...winner };
        throw new UniquePhoneError();
      },
      async save(subscriber) {
        visible = { ...subscriber };
        return { ...subscriber };
      },
    };

    const now = new Date("2026-10-30T12:00:00Z");
    const saved = await recordConsent(store, {
      phone,
      consentTextVersion: "2026-10-30",
      now,
    });

    expect(saved.id).toBe("winner");
    expect(saved.createdAt).toEqual(winner.createdAt);
    expect(saved.optedOutAt).toBeNull();
    expect(saved.consentTextVersion).toBe("2026-10-30");
    expect(saved.consentAt).toEqual(now);
  });
});

describe("recordOptOut", () => {
  it("does nothing when the number is unknown", async () => {
    const store = createMemoryStore();
    const result = await recordOptOut(store, {
      phone,
      now: new Date("2026-10-30T12:00:00Z"),
    });
    expect(result.found).toBe(false);
    expect(store.all()).toHaveLength(0);
  });

  it("is idempotent for a number that already opted out", async () => {
    const store = createMemoryStore();
    await recordConsent(store, {
      phone,
      consentTextVersion: "v1",
      now: new Date("2026-10-30T10:00:00Z"),
    });
    const firstAt = new Date("2026-10-30T11:00:00Z");
    const first = await recordOptOut(store, { phone, now: firstAt });
    const second = await recordOptOut(store, {
      phone,
      now: new Date("2026-10-30T12:00:00Z"),
    });

    expect(first.found && first.subscriber.optedOutAt).toEqual(firstAt);
    expect(second.found && second.subscriber.optedOutAt).toEqual(firstAt);
  });
});
