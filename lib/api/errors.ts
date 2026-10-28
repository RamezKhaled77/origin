export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);

    this.name = "ApiError";
  }
}

export async function getApiError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;
  let code: string | undefined;

  try {
    const body: unknown = await response.json();

    if (typeof body === "object" && body !== null) {
      if ("message" in body) {
        if (typeof body.message === "string") {
          message = body.message;
        } else if (
          Array.isArray(body.message) &&
          body.message.every((item) => typeof item === "string")
        ) {
          message = body.message.join(", ");
        }
      }

      if ("code" in body && typeof body.code === "string") {
        code = body.code;
      }
    }
  } catch {
    // Keep the fallback message when the response has no valid JSON body.
  }

  return new ApiError(message, response.status, code);
}
