import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="space-y-4 p-8">
      <h1 className="font-serif text-3xl">Workspaces (serif title)</h1>

      <p className="font-mono text-xs uppercase tracking-wider text-text-tertiary">
        mono metadata · text-tertiary
      </p>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-sm border border-status-progress-border bg-status-progress-bg px-2 py-0.5 font-mono text-[11px] uppercase text-status-progress">
          In progress
        </span>

        <span className="rounded-sm border border-status-todo-border bg-status-todo-bg px-2 py-0.5 font-mono text-[11px] uppercase text-status-todo">
          Todo
        </span>

        <span className="rounded-sm border border-label-violet-border bg-label-violet-bg px-2 py-0.5 font-mono text-[11px] text-label-violet">
          label
        </span>

        <span className="font-mono text-xs text-priority-high">High</span>
      </div>

      <Button>New Issue</Button>
    </main>
  );
}
