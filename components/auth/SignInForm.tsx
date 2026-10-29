"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PasswordInput } from "./PasswordInput";

export function SignInForm() {
  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="sign-in-email">Email address</Label>
        <Input
          autoComplete="email"
          id="sign-in-email"
          name="email"
          placeholder="you@company.com"
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="sign-in-password">Password</Label>
        </div>
        <PasswordInput
          autoComplete="current-password"
          id="sign-in-password"
          name="password"
          required
        />
      </div>

      <Button className="h-10 w-full" type="submit">
        Sign in
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
