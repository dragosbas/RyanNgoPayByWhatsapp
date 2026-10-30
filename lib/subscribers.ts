import { randomUUID } from "node:crypto";

export type Subscriber = {
  id: string;
  phone: string;
  consentAt: Date;
  consentTextVersion: string;
  optedOutAt: Date | null;
  createdAt: Date;
};

export type SubscriberStore = {
  findByPhone(phone: string): Promise<Subscriber | null>;
  insert(subscriber: Subscriber): Promise<Subscriber>;
  save(subscriber: Subscriber): Promise<Subscriber>;
};

export class UniquePhoneError extends Error {
  readonly code = "UNIQUE_PHONE";

  constructor() {
    super("phone already exists");
    this.name = "UniquePhoneError";
  }
}

/** Refresh consent on an existing row. Clears opt-out. Keeps id and createdAt. */
export function applyConsent(
  existing: Subscriber,
  consentTextVersion: string,
  now: Date,
): Subscriber {
  return {
    ...existing,
    consentAt: now,
    consentTextVersion,
    optedOutAt: null,
  };
}

/** First opt-out stamps the time. A later opt-out leaves that stamp alone. */
export function applyOptOut(
  existing: Subscriber,
  now: Date,
): { subscriber: Subscriber; changed: boolean } {
  if (existing.optedOutAt) {
    return { subscriber: existing, changed: false };
  }
  return {
    subscriber: { ...existing, optedOutAt: now },
    changed: true,
  };
}

export async function recordConsent(
  store: SubscriberStore,
  input: {
    phone: string;
    consentTextVersion: string;
    now: Date;
    newId?: () => string;
  },
): Promise<Subscriber> {
  const existing = await store.findByPhone(input.phone);
  if (existing) {
    return store.save(
      applyConsent(existing, input.consentTextVersion, input.now),
    );
  }

  const created: Subscriber = {
    id: (input.newId ?? randomUUID)(),
    phone: input.phone,
    consentAt: input.now,
    consentTextVersion: input.consentTextVersion,
    optedOutAt: null,
    createdAt: input.now,
  };

  try {
    return await store.insert(created);
  } catch (error) {
    if (!(error instanceof UniquePhoneError)) throw error;
    const raced = await store.findByPhone(input.phone);
    if (!raced) throw error;
    return store.save(
      applyConsent(raced, input.consentTextVersion, input.now),
    );
  }
}

export async function recordOptOut(
  store: SubscriberStore,
  input: { phone: string; now: Date },
): Promise<{ found: false } | { found: true; subscriber: Subscriber }> {
  const existing = await store.findByPhone(input.phone);
  if (!existing) return { found: false };

  const next = applyOptOut(existing, input.now);
  if (!next.changed) return { found: true, subscriber: existing };

  const saved = await store.save(next.subscriber);
  return { found: true, subscriber: saved };
}

export function createMemoryStore(): SubscriberStore & {
  all(): Subscriber[];
} {
  const rows = new Map<string, Subscriber>();

  return {
    async findByPhone(phone) {
      for (const row of rows.values()) {
        if (row.phone === phone) return clone(row);
      }
      return null;
    },
    async insert(subscriber) {
      for (const row of rows.values()) {
        if (row.phone === subscriber.phone) throw new UniquePhoneError();
      }
      rows.set(subscriber.id, clone(subscriber));
      return clone(subscriber);
    },
    async save(subscriber) {
      if (!rows.has(subscriber.id)) {
        throw new Error(`unknown subscriber ${subscriber.id}`);
      }
      rows.set(subscriber.id, clone(subscriber));
      return clone(subscriber);
    },
    all() {
      return [...rows.values()].map(clone);
    },
  };
}

function clone(subscriber: Subscriber): Subscriber {
  return {
    ...subscriber,
    consentAt: new Date(subscriber.consentAt),
    createdAt: new Date(subscriber.createdAt),
    optedOutAt: subscriber.optedOutAt ? new Date(subscriber.optedOutAt) : null,
  };
}
