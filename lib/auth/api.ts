import "server-only";

import { cookies } from "next/headers";

import { ApiError } from "@/lib/api/errors";
import { serverApiFetch } from "@/lib/api/server/fetcher";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import type { AuthResponse, User } from "@/lib/auth/types";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const response = await serverApiFetch<AuthResponse>("/auth/me", {
      cookie: `${sessionCookie.name}=${sessionCookie.value}`,
    });

    return response.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}
