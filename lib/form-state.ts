import { copy, type CopyErrorCode } from "@/content/copy";
import type { SignupResult } from "@/lib/signup";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  phoneError?: string;
  consentError?: string;
};

export const idleFormState: FormState = { status: "idle", message: "" };

export function toFormState(
  result: SignupResult,
  successMessage: string,
): FormState {
  if (result.ok) {
    return { status: "success", message: successMessage };
  }
  if ("error" in result) {
    return {
      status: "error",
      message: copy.errors[result.error satisfies CopyErrorCode],
    };
  }
  return {
    status: "error",
    message: "",
    phoneError: result.fields.phone
      ? copy.errors[result.fields.phone]
      : undefined,
    consentError: result.fields.consent
      ? copy.errors[result.fields.consent]
      : undefined,
  };
}
