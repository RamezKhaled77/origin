import { afterEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api/client/fetcher";

import { signIn, signOut, signUp } from "./client";

vi.mock("@/lib/api/client/fetcher", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe("Auth client", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sends the correct sign-in request", async () => {
    const input = {
      email: "ramez@example.com",
      password: "secret123",
    };

    apiFetchMock.mockResolvedValueOnce({
      user: { id: "1", name: "Ramez", email: input.email },
    });

    await signIn(input);

    expect(apiFetchMock).toHaveBeenCalledWith("/api/auth/signin", {
      method: "POST",
      body: input,
    });
  });

  it("sends the correct sign-up request", async () => {
    const input = {
      name: "Ramez",
      email: "ramez@example.com",
      password: "secret123",
      passwordConfirm: "secret123",
    };

    apiFetchMock.mockResolvedValueOnce({
      user: { id: "1", name: input.name, email: input.email },
    });

    await signUp(input);

    expect(apiFetchMock).toHaveBeenCalledWith("/api/auth/signup", {
      method: "POST",
      body: input,
    });
  });

  it("sends the correct sign-out request", async () => {
    apiFetchMock.mockResolvedValueOnce({
      message: "Logged out successfully",
    });

    await signOut();

    expect(apiFetchMock).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });
  });
});
