"use client";

import Link from "next/link";
import { signUpSchema, type SignUpFormValues } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api/client/fetcher";
import { ApiError } from "@/lib/api/errors";
import type { AuthResponse } from "@/lib/auth/types";

import { PasswordInput } from "./PasswordInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (values: SignUpFormValues) => {
    setServerError(null);

    try {
      await apiFetch<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: values,
      });

      router.replace("/workspaces");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setServerError("An account with this email already exists.");
        } else if (error.status === 400) {
          setServerError("Please check your form data and make sure the passwords match.");
        } else {
          setServerError(error.message);
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="sign-up-name">Full name</Label>
        <Input
          autoComplete="name"
          id="sign-up-name"
          placeholder="Your name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "sign-up-name-error" : undefined}
          {...register("name")}
          type="text"
        />
        {errors.name && (
          <p id="sign-up-name-error" className="text-xs text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-up-email">Work email</Label>
        <Input
          autoComplete="email"
          id="sign-up-email"
          {...register("email")}
          placeholder="you@company.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "sign-up-email-error" : undefined}
          type="email"
        />
        {errors.email && (
          <p id="sign-up-email-error" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-up-password">Password</Label>
        <PasswordInput
          autoComplete="new-password"
          id="sign-up-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "sign-up-password-error" : undefined}
          {...register("password")}
        />{" "}
        {errors.password && (
          <p id="sign-up-password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-up-password-confirm">Confirm password</Label>
        <PasswordInput
          autoComplete="new-password"
          id="sign-up-password-confirm"
          aria-invalid={!!errors.passwordConfirm}
          aria-describedby={errors.passwordConfirm ? "sign-up-password-confirm-error" : undefined}
          {...register("passwordConfirm")}
        />{" "}
        {errors.passwordConfirm && (
          <p id="sign-up-password-confirm-error" className="text-xs text-destructive">
            {errors.passwordConfirm.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button disabled={isSubmitting} className="h-10 w-full" type="submit">
        {isSubmitting ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-xs text-text-secondary">
        Already have an account?{" "}
        <Link
          className="font-medium text-primary underline-offset-4 hover:underline"
          href="/sign-in"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
