import Link from "next/link";
import {
  FolderKanban,
  LayoutGrid,
  ListChecks,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

type GlobalSidebarProps = {
  userName: string;
  activeItem?: "workspaces" | "all-projects" | "my-issues";
};

const navigation = [
  { href: "/workspaces", label: "Workspaces", icon: LayoutGrid, key: "workspaces" },
  { href: "/workspaces/all", label: "All Projects", icon: FolderKanban, key: "all-projects" },
  { href: "/my-issues", label: "My Issues", icon: ListChecks, key: "my-issues" },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function GlobalSidebar({
  userName,
  activeItem = "workspaces",
}: GlobalSidebarProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-border px-3 py-3">
        <Link href="/workspaces" className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center bg-primary font-mono text-[10px] font-semibold text-primary-foreground">
            O
          </span>
          <span className="font-serif text-base">Origin</span>
        </Link>
        <p className="mt-0.5 pl-7 font-mono text-[9px] uppercase tracking-[0.12em] text-text-tertiary">
          Issue tracker
        </p>
      </div>
      <nav aria-label="Global navigation" className="p-2">
        <p className="px-2 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          Navigate
        </p>
        <ul className="space-y-0.5">
          {navigation.map(({ href, label, icon: Icon, key }) => (
            <li key={key}>
              <Link
                href={href}
                aria-current={activeItem === key ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center gap-2 px-2 text-sm text-text-secondary transition-colors hover:bg-surface-low hover:text-text-primary",
                  activeItem === key && "bg-primary-muted font-medium text-primary",
                )}
              >
                <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto border-t border-border p-2">
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="flex size-7 items-center justify-center bg-primary-muted font-mono text-[10px] text-primary">
            {initials(userName) || <UserRound size={14} aria-hidden="true" />}
          </span>
          <span className="min-w-0 truncate text-xs text-text-secondary">{userName}</span>
        </div>
      </div>
    </div>
  );
}
