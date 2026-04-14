import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("auth validation", () => {
  it("rejects invalid login email input with a user-friendly message", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Enter a valid email address.",
      );
    }
  });

  it("rejects short registration passwords with a clear message", () => {
    const result = registerSchema.safeParse({
      name: "Demo User",
      email: "demo@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Password must be at least 8 characters.",
      );
    }
  });
});
