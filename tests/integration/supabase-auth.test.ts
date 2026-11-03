import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validations";

describe("Supabase Admin Authentication & Rate Limiting Integration", () => {
  it("validates administrator login payloads before invoking Supabase Auth", () => {
    const valid = adminLoginSchema.safeParse({
      email: "admin@scentsandmists.com",
      password: "luxury-admin-password-2026",
    });
    expect(valid.success).toBe(true);

    const shortPassword = adminLoginSchema.safeParse({
      email: "admin@scentsandmists.com",
      password: "123",
    });
    expect(shortPassword.success).toBe(false);
  });

  it("enforces rate limiting across repeated login attempts from the same key", () => {
    const key = `test-login-${Date.now()}`;
    const first = checkRateLimit(key, 2, 60_000);
    const second = checkRateLimit(key, 2, 60_000);
    const third = checkRateLimit(key, 2, 60_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });
});

