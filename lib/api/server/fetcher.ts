import "server-only";

import { getApiError } from "@/lib/api/errors";

type ServerFetcherOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  cookie?: string;
};

export async function serverApiFetch<T>(
  path: `/${string}`,
  options: ServerFetcherOptions = {},
): Promise<T> {
  const { body, cookie, headers, ...init } = options;

  const response = await fetch(`${process.env.API_URL}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: init.cache ?? "no-store",
  });

  if (!response.ok) {
    throw await getApiError(response);
  }

  return (await response.json()) as T;
}
