"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PasswordInput } from "./PasswordInput";

export function SignUpForm() {
  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="sign-up-name">Full name</Label>
        <Input
          autoComplete="name"
          id="sign-up-name"
          name="name"
          placeholder="Your name"
          required
          type="text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-up-email">Work email</Label>
        <Input
          autoComplete="email"
          id="sign-up-email"
          name="email"
          placeholder="you@company.com"
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-up-password">Password</Label>
        <PasswordInput autoComplete="new-password" id="sign-up-password" name="password" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sign-up-password-confirm">Confirm password</Label>
        <PasswordInput
          autoComplete="new-password"
          id="sign-up-password-confirm"
          name="passwordConfirm"
          required
        />
      </div>

      <Button className="h-10 w-full" type="submit">
        Create account
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
