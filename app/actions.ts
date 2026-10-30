"use server";

import { headers } from "next/headers";
import { copy } from "@/content/copy";
import { toFormState, type FormState } from "@/lib/form-state";
import { clientIpFromHeaders } from "@/lib/ip";
import { prismaStore } from "@/lib/prisma-store";
import { rateLimiter } from "@/lib/rate-limit";
import { handleSubscribe, handleUnsubscribe } from "@/lib/signup";

async function requestIp(): Promise<string> {
  const headerList = await headers();
  return clientIpFromHeaders((name) => headerList.get(name));
}

export async function subscribeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const result = await handleSubscribe(
      {
        store: prismaStore,
        rateLimit: rateLimiter,
        now: () => new Date(),
        consentVersion: copy.consent.version,
      },
      {
        phone: String(formData.get("phone") ?? ""),
        consent: formData.get("consent") === "yes",
        honeypot: String(formData.get("website") ?? ""),
        ip: await requestIp(),
      },
    );
    return toFormState(result, copy.home.success);
  } catch (error) {
    console.error("subscribe failed", error);
    return { status: "error", message: copy.errors.unavailable };
  }
}

export async function unsubscribeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const result = await handleUnsubscribe(
      {
        store: prismaStore,
        rateLimit: rateLimiter,
        now: () => new Date(),
      },
      {
        phone: String(formData.get("phone") ?? ""),
        honeypot: String(formData.get("website") ?? ""),
        ip: await requestIp(),
      },
    );
    return toFormState(result, copy.unsubscribe.success);
  } catch (error) {
    console.error("unsubscribe failed", error);
    return { status: "error", message: copy.errors.unavailable };
  }
}
