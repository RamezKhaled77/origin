import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppShellProps = {
  sidebar: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ sidebar, actions, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-surface-canvas text-text-primary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-surface-lowest focus:px-3 focus:py-2 focus:text-primary"
      >
        Skip to content
      </a>
      <aside className="w-60 shrink-0 border-r border-border bg-surface-lowest">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-surface-lowest px-3">
          <p className="font-mono text-[11px] text-text-secondary" aria-label="Current location">
            Origin / <span className="text-primary">Workspaces</span>
          </p>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <main id="main-content" className={cn("min-w-0 flex-1")}>
          {children}
        </main>
      </div>
    </div>
  );
}
