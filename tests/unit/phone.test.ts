import { describe, expect, it } from "vitest";
import { normalizeToE164 } from "@/lib/phone";

describe("normalizeToE164", () => {
  it("reads local Romanian numbers as +40", () => {
    expect(normalizeToE164("0722123456")).toBe("+40722123456");
    expect(normalizeToE164("0722 123 456")).toBe("+40722123456");
    expect(normalizeToE164("(0722) 123-456")).toBe("+40722123456");
    expect(normalizeToE164("  0722 123 456  ")).toBe("+40722123456");
  });

  it("accepts explicit country codes and the 00 prefix", () => {
    expect(normalizeToE164("+40 722 123 456")).toBe("+40722123456");
    expect(normalizeToE164("0040 722 123 456")).toBe("+40722123456");
    expect(normalizeToE164("+442071838750")).toBe("+442071838750");
    expect(normalizeToE164("+1 415 555 2671")).toBe("+14155552671");
  });

  it("rejects empty, junk, and incomplete numbers", () => {
    expect(normalizeToE164("")).toBeNull();
    expect(normalizeToE164("   ")).toBeNull();
    expect(normalizeToE164("abc")).toBeNull();
    expect(normalizeToE164("123")).toBeNull();
    expect(normalizeToE164("0722")).toBeNull();
    expect(normalizeToE164("a".repeat(41))).toBeNull();
  });
});
