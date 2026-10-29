import { apiFetch } from "@/lib/api/client/fetcher";
import type { AuthResponse } from "@/lib/auth/types";

type SignInInput = {
  email: string;
  password: string;
};

type SignUpInput = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export function signIn(input: SignInInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/signin", {
    method: "POST",
    body: input,
  });
}

export function signUp(input: SignUpInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: input,
  });
}

export function signOut(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}
