import { describe, expect, it } from "vitest";

import { signInSchema } from "./schemas";

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    const result = signInSchema.safeParse({
      email: "ramez@example.com",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = signInSchema.safeParse({
      email: "ramez@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
