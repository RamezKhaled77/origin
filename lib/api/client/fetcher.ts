import { getApiError } from "@/lib/api/errors";

type FetcherOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiFetch<T>(
  path: `/api/${string}`,
  options: FetcherOptions = {},
): Promise<T> {
  const { body, headers, ...init } = options;

  const response = await fetch(path, {
    ...init,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  return (await response.json()) as T;
}
