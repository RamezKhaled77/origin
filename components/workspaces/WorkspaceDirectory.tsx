"use client";

import { Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WorkspaceDirectory() {
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
    </section>
  );
}
