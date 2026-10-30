import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

const MAX_LENGTH = 40;

/**
 * Normalize a phone string to E.164.
 * Numbers without a country code are read as Romanian (+40).
 * Returns null when the number is empty or not a valid phone number.
 */
export function normalizeToE164(
  input: string,
  defaultCountry: CountryCode = "RO",
): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_LENGTH) return null;

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (!parsed || !parsed.isValid()) return null;

  return parsed.number;
}
