import { describe, expect, it } from "vitest";
import { clientIpFromHeaders } from "@/lib/ip";
import { createRateLimiter } from "@/lib/rate-limit";

describe("clientIpFromHeaders", () => {
  it("uses the first forwarded address", () => {
    const ip = clientIpFromHeaders((name) =>
      name === "x-forwarded-for" ? "203.0.113.4, 10.0.0.8" : null,
    );
    expect(ip).toBe("203.0.113.4");
  });

  it("strips the port App Service appends to an IPv4 forwarded address", () => {
    expect(
      clientIpFromHeaders((name) =>
        name === "x-forwarded-for" ? "1.2.3.4:5678, 10.0.0.1:443" : null,
      ),
    ).toBe("1.2.3.4");
  });

  it("strips the port App Service appends to a bracketed IPv6 address", () => {
    expect(
      clientIpFromHeaders((name) =>
        name === "x-forwarded-for" ? "[::1]:5678" : null,
      ),
    ).toBe("::1");
  });

  it("falls back to x-real-ip and then unknown", () => {
    expect(
      clientIpFromHeaders((name) =>
        name === "x-real-ip" ? "198.51.100.20" : null,
      ),
    ).toBe("198.51.100.20");
    expect(clientIpFromHeaders(() => null)).toBe("unknown");
  });
});

describe("createRateLimiter", () => {
  it("blocks inside the window and allows a request after it expires", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1_000 });
    expect(limiter.consume("a", 0).ok).toBe(true);
    expect(limiter.consume("a", 10).ok).toBe(true);
    expect(limiter.consume("a", 20).ok).toBe(false);
    expect(limiter.consume("a", 1_001).ok).toBe(true);
  });
});
