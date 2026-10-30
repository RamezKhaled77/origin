import { FolderKanban, Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export type CrossWorkspaceProject = {
  id: string;
  name: string;
  description: string | null;
  issueCount: number;
  openCount: number;
  urgentCount: number;
};

export type CrossWorkspaceGroup = {
  id: string;
  name: string;
  projectCount: number;
  issueCount: number;
  openCount: number;
  urgentCount: number;
  projects: CrossWorkspaceProject[];
};

type AllProjectsDirectoryProps = {
  workspaces?: CrossWorkspaceGroup[];
};

export function AllProjectsDirectory({ workspaces = [] }: AllProjectsDirectoryProps) {
  const hasProjects = workspaces.some((workspace) => workspace.projects.length > 0);

  return (
    <section
      className="mx-auto w-full max-w-6xl px-6 py-8"
      aria-labelledby="all-projects-title"
    >
      <div className="border-b border-border pb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
          Cross-workspace directory
        </p>
        <h1 id="all-projects-title" className="mt-1 font-serif text-3xl">
          All Projects
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Projects across the workspaces you can access.
        </p>
      </div>

      <div className="mt-5 max-w-sm">
        <label htmlFor="project-search" className="sr-only">
          Search projects by name
        </label>
        <div className="relative">
          <Search
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <Input
            id="project-search"
            type="search"
            placeholder="Search projects"
            className="h-8 pl-8"
          />
        </div>
      </div>

      {hasProjects ? (
        <div className="mt-8 space-y-6">
          {workspaces.map((workspace) => (
            <section
              key={workspace.id}
              className="border border-border bg-surface-lowest"
              aria-labelledby={`workspace-${workspace.id}`}
            >
              <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border bg-surface-low px-4 py-3">
                <h2 id={`workspace-${workspace.id}`} className="font-medium">
                  {workspace.name}
                </h2>
                <p className="font-mono text-[10px] text-text-tertiary">
                  {workspace.projectCount}{" "}
                  {workspace.projectCount === 1 ? "project" : "projects"} ·{" "}
                  {workspace.issueCount} {workspace.issueCount === 1 ? "issue" : "issues"}
                </p>
              </header>
              <div className="divide-y divide-border-hairline">
                {workspace.projects.map((project) => (
                  <article
                    key={project.id}
                    className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <h3 className="flex items-center gap-2 font-medium">
                        <FolderKanban
                          size={14}
                          aria-hidden="true"
                          className="shrink-0 text-text-tertiary"
                        />
                        <span className="truncate">{project.name}</span>
                      </h3>
                      {project.description ? (
                        <p className="mt-1 text-xs text-text-secondary">
                          {project.description}
                        </p>
                      ) : null}
                    </div>
                    <dl className="flex gap-4 font-mono text-[10px] text-text-tertiary sm:items-center">
                      <div>
                        <dt className="sr-only">Issues</dt>
                        <dd>{project.issueCount} issues</dd>
                      </div>
                      <div>
                        <dt className="sr-only">Open issues</dt>
                        <dd>{project.openCount} open</dd>
                      </div>
                      <div>
                        <dt className="sr-only">Urgent issues</dt>
                        <dd>{project.urgentCount} urgent</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-dashed border-border-strong bg-surface-lowest px-6 py-14 text-center">
          <h2 className="font-serif text-xl">No projects yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Projects from your workspaces will appear here when they are available.
          </p>
        </div>
      )}
    </section>
  );
}
