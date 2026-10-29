import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas">
      <header className="border-b border-border-hairline bg-surface-lowest">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-6">
          <Link
            className="font-serif text-lg font-semibold tracking-tight text-text-primary"
            href="/"
          >
            Origin
          </Link>
          <span className="font-mono text-[10px] tracking-[0.18em] text-text-tertiary uppercase">
            Issue tracker
          </span>
        </div>
      </header>

      {children}

      <footer className="border-t border-border-hairline bg-surface-lowest">
        <div className="mx-auto flex min-h-10 w-full max-w-6xl items-center px-6">
          <p className="font-mono text-[10px] tracking-[0.12em] text-text-tertiary uppercase">
            Origin Issue Tracker
          </p>
        </div>
      </footer>
    </div>
  );
}
