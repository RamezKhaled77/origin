"use client";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signInSchema, type SignInFormValues } from "@/lib/auth/schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PasswordInput } from "./PasswordInput";
import { LoaderCircle } from "lucide-react";

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    // We'll connect the sign-in API in the next step.
    console.log(values);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="sign-in-email">Email address</Label>
        <Input
          autoComplete="email"
          id="sign-in-email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "sign-in-email-error" : undefined}
          placeholder="you@company.com"
          {...register("email")}
          type="email"
        />
        {errors.email && (
          <p id="sign-in-email-error" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="sign-in-password">Password</Label>
        </div>
        <PasswordInput
          autoComplete="current-password"
          id="sign-in-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "sign-in-password-error" : undefined}
          {...register("password")}
        />{" "}
        {errors.password && (
          <p id="sign-in-password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button disabled={isSubmitting} className="h-10 w-full" type="submit">
        {isSubmitting ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-xs text-text-secondary">
        New to Origin?{" "}
        <Link
          className="font-medium text-primary underline-offset-4 hover:underline"
          href="/sign-up"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
