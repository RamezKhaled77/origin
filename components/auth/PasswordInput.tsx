"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import * as React from "react";

import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        className={`pr-9 ${className ?? ""}`}
        type={isVisible ? "text" : "password"}
      />
      <button
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-text-tertiary hover:text-text-primary focus-visible:z-10 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        onClick={() => setIsVisible((visible) => !visible)}
        type="button"
      >
        {isVisible ? (
          <EyeSlash aria-hidden="true" size={16} />
        ) : (
          <Eye aria-hidden="true" size={16} />
        )}
      </button>
    </div>
  );
}
