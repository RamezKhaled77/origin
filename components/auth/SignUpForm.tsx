"use client";

import Link from "next/link";
import { signUpSchema, type SignUpFormValues } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";

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

  const onSubmit = async (values: SignUpFormValues) => {
    console.log(values);
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
