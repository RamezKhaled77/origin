"use client";

import { Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type WorkspaceDirectoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: "owner" | "member";
  projectCount: number;
  issueCount: number;
  memberCount: number;
  countsByStatus: {
    backlog: number;
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
    cancelled: number;
  };
  lastActivityAt: string | null;
};

type WorkspaceDirectoryProps = {
  workspaces?: WorkspaceDirectoryItem[];
};

const STATUS_LABELS = [
  ["backlog", "Backlog"],
  ["todo", "Todo"],
  ["in_progress", "In progress"],
  ["in_review", "In review"],
  ["done", "Done"],
  ["cancelled", "Cancelled"],
] as const;

export function WorkspaceDirectory({ workspaces = [] }: WorkspaceDirectoryProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8" aria-labelledby="workspaces-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
            Directory
          </p>
          <h1 id="workspaces-title" className="mt-1 font-serif text-3xl">
            Workspaces
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Workspaces you can access.
          </p>
        </div>
        <Button type="button" className="gap-1.5">
          <Plus size={14} aria-hidden="true" />
          New Workspace
        </Button>
      </div>
      <div className="mt-5 max-w-sm">
        <label htmlFor="workspace-search" className="sr-only">
          Search workspaces by name
        </label>
        <div className="relative">
          <Search
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <Input
            id="workspace-search"
            type="search"
            placeholder="Search workspaces"
            className="h-8 pl-8"
          />
        </div>
      </div>
      {workspaces.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {workspaces.map((workspace) => (
            <article
              key={workspace.id}
              className="border border-border bg-surface-lowest"
            >
              <header className="border-b border-border bg-surface-low px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-medium">{workspace.name}</h2>
                    <p className="mt-0.5 font-mono text-[10px] text-text-tertiary">
                      /{workspace.slug}
                    </p>
                  </div>
                  <span className="shrink-0 border border-primary-border bg-primary-muted px-2 py-0.5 font-mono text-[10px] uppercase text-primary">
                    {workspace.role}
                  </span>
                </div>
                {workspace.description ? (
                  <p className="mt-3 text-xs text-text-secondary">{workspace.description}</p>
                ) : null}
              </header>
              <dl className="grid grid-cols-3 divide-x divide-border border-b border-border">
                <div className="px-4 py-3">
                  <dt className="font-mono text-[10px] uppercase text-text-tertiary">
                    Projects
                  </dt>
                  <dd className="mt-1 font-serif text-xl">{workspace.projectCount}</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="font-mono text-[10px] uppercase text-text-tertiary">
                    Issues
                  </dt>
                  <dd className="mt-1 font-serif text-xl">{workspace.issueCount}</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="font-mono text-[10px] uppercase text-text-tertiary">
                    Members
                  </dt>
                  <dd className="mt-1 font-serif text-xl">{workspace.memberCount}</dd>
                </div>
              </dl>
              <div className="px-4 py-3">
                <h3 className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  Status breakdown
                </h3>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  {STATUS_LABELS.map(([key, label]) => (
                    <div key={key} className="flex justify-between gap-2 text-xs">
                      <dt className="text-text-secondary">{label}</dt>
                      <dd className="font-mono text-text-primary">
                        {workspace.countsByStatus[key]}
                      </dd>
                    </div>
                  ))}
                </dl>
                {workspace.lastActivityAt ? (
                  <p className="mt-4 font-mono text-[10px] text-text-tertiary">
                    Last activity {workspace.lastActivityAt}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-dashed border-border-strong bg-surface-lowest px-6 py-14 text-center">
          <h2 className="font-serif text-xl">No workspaces yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Create a workspace to organize projects and issues with your team.
          </p>
          <Button type="button" variant="outline" className="mt-5">
            <Plus size={14} aria-hidden="true" />
            New Workspace
          </Button>
        </div>
      )}
    </section>
  );
}
