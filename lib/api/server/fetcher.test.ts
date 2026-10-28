import { afterEach, describe, expect, it, vi } from "vitest";

const { getApiErrorMock } = vi.hoisted(() => ({
  getApiErrorMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/api/errors", () => ({
  getApiError: getApiErrorMock,
}));

import { serverApiFetch } from "./fetcher";

describe("serverApiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("throws the parsed API error when the response is not successful", async () => {
    const apiError = Object.assign(new Error("Unauthorized"), {
      status: 401,
    });

    getApiErrorMock.mockResolvedValueOnce(apiError);

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 401, message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(serverApiFetch("/auth/me")).rejects.toBe(apiError);

    expect(getApiErrorMock).toHaveBeenCalledOnce();
  });

  it("forwards the session cookie and disables caching by default", async () => {
    vi.stubEnv("API_URL", "http://localhost:5000");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await serverApiFetch<{ user: { id: string } }>("/auth/me", {
      cookie: "sid=test-session",
    });

    expect(result.user.id).toBe("1");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5000/auth/me",
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Cookie: "sid=test-session",
        }),
      }),
    );
  });
});
