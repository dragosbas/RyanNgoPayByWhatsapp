import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  UniquePhoneError,
  type Subscriber,
  type SubscriberStore,
} from "@/lib/subscribers";

function toSubscriber(row: {
  id: string;
  phone: string;
  consentAt: Date;
  consentTextVersion: string;
  optedOutAt: Date | null;
  createdAt: Date;
}): Subscriber {
  return {
    id: row.id,
    phone: row.phone,
    consentAt: row.consentAt,
    consentTextVersion: row.consentTextVersion,
    optedOutAt: row.optedOutAt,
    createdAt: row.createdAt,
  };
}

export function createPrismaStore(client: PrismaClient = prisma): SubscriberStore {
  return {
    async findByPhone(phone) {
      const row = await client.subscriber.findUnique({ where: { phone } });
      return row ? toSubscriber(row) : null;
    },
    async insert(subscriber) {
      try {
        const row = await client.subscriber.create({ data: subscriber });
        return toSubscriber(row);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new UniquePhoneError();
        }
        throw error;
      }
    },
    async save(subscriber) {
      const row = await client.subscriber.update({
        where: { id: subscriber.id },
        data: {
          consentAt: subscriber.consentAt,
          consentTextVersion: subscriber.consentTextVersion,
          optedOutAt: subscriber.optedOutAt,
        },
      });
      return toSubscriber(row);
    },
  };
}

export const prismaStore = createPrismaStore();
