"use client";

import Link from "next/link";
import { useActionState } from "react";
import { subscribeAction } from "@/app/actions";
import { copy } from "@/content/copy";
import { idleFormState } from "@/lib/form-state";

export function HeroSignup() {
  const [state, formAction, pending] = useActionState(
    subscribeAction,
    idleFormState,
  );

  if (state.status === "success") {
    return (
      <div className="hero-copy success-copy">
        <h1>{copy.home.successTitle}</h1>
        <p role="status">{state.message}</p>
        <Link className="text-link" href="/unsubscribe">
          {copy.home.successLink}
        </Link>
      </div>
    );
  }

  const phoneDescribedBy = [
    "phone-hint",
    state.phoneError ? "phone-error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="hero-copy">
      <h1>{copy.home.headline}</h1>
      <p className="lede">{copy.home.lede}</p>
      <form className="signup-form" action={formAction}>
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
        <label className="sr-only" htmlFor="phone">
          {copy.form.phoneLabel}
        </label>
        <p id="phone-hint" className="sr-only">
          {copy.form.phoneHint}
        </p>
        <div className="pill">
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={copy.form.phonePlaceholder}
            aria-invalid={state.phoneError ? true : undefined}
            aria-describedby={phoneDescribedBy}
            required
            onInvalid={(event) => {
              event.currentTarget.setCustomValidity(copy.errors.phone_required);
            }}
            onInput={(event) => {
              event.currentTarget.setCustomValidity("");
            }}
          />
          <button className="pill-button" type="submit" disabled={pending}>
            {pending ? copy.form.pending : copy.form.submit}
          </button>
        </div>
        {state.phoneError ? (
          <p id="phone-error" className="field-error" role="alert">
            {state.phoneError}
          </p>
        ) : null}
        <label className="consent">
          <input
            name="consent"
            type="checkbox"
            value="yes"
            required
            onInvalid={(event) => {
              event.currentTarget.setCustomValidity(copy.errors.consent_required);
            }}
            onChange={(event) => {
              event.currentTarget.setCustomValidity("");
            }}
            aria-invalid={state.consentError ? true : undefined}
            aria-describedby={state.consentError ? "consent-error" : undefined}
          />
          <span>{copy.consent.body}</span>
        </label>
        {state.consentError ? (
          <p id="consent-error" className="field-error" role="alert">
            {state.consentError}
          </p>
        ) : null}
        {state.message ? (
          <p className="form-error" role="alert">
            {state.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
