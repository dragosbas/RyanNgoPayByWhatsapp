"use client";

import { useActionState } from "react";
import { unsubscribeAction } from "@/app/actions";
import { copy } from "@/content/copy";
import { idleFormState } from "@/lib/form-state";

export function UnsubscribeForm() {
  const [state, formAction, pending] = useActionState(
    unsubscribeAction,
    idleFormState,
  );

  if (state.status === "success") {
    return (
      <p className="success-note" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form className="stack-form" action={formAction}>
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">{copy.form.honeypot}</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
      <label htmlFor="phone">{copy.form.phoneLabel}</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={copy.form.phonePlaceholder}
        aria-invalid={state.phoneError ? true : undefined}
        aria-describedby={state.phoneError ? "phone-error" : "phone-hint"}
        required
        onInvalid={(event) => {
          event.currentTarget.setCustomValidity(copy.errors.phone_required);
        }}
        onInput={(event) => {
          event.currentTarget.setCustomValidity("");
        }}
      />
      <p id="phone-hint" className="sr-only">
        {copy.form.phoneHint}
      </p>
      {state.phoneError ? (
        <p id="phone-error" className="field-error" role="alert">
          {state.phoneError}
        </p>
      ) : null}
      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? copy.unsubscribe.pending : copy.unsubscribe.submit}
      </button>
    </form>
  );
}
