import Link from "next/link";
import {
  AlertCircle,
  Check,
  ChevronDown,
  CircleDot,
  Filter,
  Search,
} from "lucide-react";

import { Input } from "@/components/ui/input";

type IssueStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "cancelled";
type IssuePriority = "no_priority" | "low" | "medium" | "high" | "urgent";

export type MyIssue = {
  id: string;
  title: string;
  workspaceSlug: string;
  workspaceName: string;
  projectName: string;
  status: IssueStatus;
  priority: IssuePriority;
  labels: string[];
  dueDate: string | null;
  isOverdue: boolean;
};

type MyIssuesDirectoryProps = {
  issues?: MyIssue[];
};

const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
  cancelled: "Cancelled",
};

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  no_priority: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const STATUS_CLASSES: Record<IssueStatus, string> = {
  backlog: "border-status-planning-border bg-status-planning-bg text-status-planning",
  todo: "border-status-todo-border bg-status-todo-bg text-status-todo",
  in_progress: "border-status-progress-border bg-status-progress-bg text-status-progress",
  in_review: "border-status-active-border bg-status-active-bg text-status-active",
  done: "border-status-resolved-border bg-status-resolved-bg text-status-resolved",
  cancelled: "text-text-tertiary line-through",
};

function isActive(issue: MyIssue) {
  return issue.status !== "done" && issue.status !== "cancelled";
}

function getSummary(issues: MyIssue[]) {
  return {
    assigned: issues.filter(isActive).length,
    inProgress: issues.filter(
      (issue) => issue.status === "in_progress" || issue.status === "in_review",
    ).length,
    urgentHigh: issues.filter(
      (issue) =>
        isActive(issue) && (issue.priority === "urgent" || issue.priority === "high"),
    ).length,
    overdue: issues.filter((issue) => isActive(issue) && issue.isOverdue).length,
  };
}

function PriorityIndicator({ priority }: { priority: IssuePriority }) {
  if (priority === "no_priority") {
    return <span className="text-text-tertiary">— No priority</span>;
  }

  const color =
    priority === "urgent"
      ? "text-status-urgent"
      : priority === "high"
        ? "text-priority-high"
        : priority === "medium"
          ? "text-status-progress"
          : "text-text-tertiary";

  return (
    <span className={`inline-flex items-center gap-1 ${color}`}>
      <CircleDot size={11} aria-hidden="true" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

function SummaryTile({
  label,
  value,
  caption,
  isAlert = false,
}: {
  label: string;
  value: number;
  caption: string;
  isAlert?: boolean;
}) {
  return (
    <div
      className={`border-r border-border px-4 py-3 first:border-l ${
        isAlert ? "bg-status-urgent-bg" : "bg-surface-lowest"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{caption}</p>
    </div>
  );
}

export function MyIssuesDirectory({ issues = [] }: MyIssuesDirectoryProps) {
  const summary = getSummary(issues);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-7" aria-labelledby="my-issues-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
            Cross-workspace issue list
          </p>
          <h1 id="my-issues-title" className="mt-1 font-serif text-3xl">
            My Issues
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Issues assigned to you across your workspaces.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 border border-border bg-surface-lowest px-2.5 text-xs text-text-secondary hover:bg-surface-low"
        >
          <Check size={14} aria-hidden="true" />
          Bulk actions
          <ChevronDown size={13} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 border-y border-border sm:grid-cols-4">
        <SummaryTile label="Assigned" value={summary.assigned} caption="active issues" />
        <SummaryTile label="In progress" value={summary.inProgress} caption="being worked on" />
        <SummaryTile label="Urgent / high" value={summary.urgentHigh} caption="needs attention" />
        <SummaryTile
          label="Overdue"
          value={summary.overdue}
          caption="past due date"
          isAlert
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <label htmlFor="issue-search" className="sr-only">
            Search my issues
          </label>
          <Search
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <Input id="issue-search" type="search" placeholder="Filter my issues" className="pl-8" />
        </div>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 border border-input bg-surface-lowest px-2.5 text-xs text-text-secondary"
        >
          <Filter size={13} aria-hidden="true" />
          Status: All
        </button>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 border border-input bg-surface-lowest px-2.5 text-xs text-text-secondary"
        >
          Priority: All
        </button>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 border border-input bg-surface-lowest px-2.5 text-xs text-text-secondary"
        >
          Project: All
        </button>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 border border-input bg-surface-lowest px-2.5 text-xs text-text-secondary"
        >
          Overdue only
        </button>
      </div>

      <div className="mt-5 overflow-x-auto border border-border bg-surface-lowest">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <caption className="sr-only">Issues assigned to you</caption>
          <thead className="bg-surface-low">
            <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              <th scope="col" className="w-10 px-3 py-2">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="px-3 py-2">
                Issue
              </th>
              <th scope="col" className="px-3 py-2">
                Status
              </th>
              <th scope="col" className="px-3 py-2">
                Priority
              </th>
              <th scope="col" className="px-3 py-2">
                Project
              </th>
              <th scope="col" className="px-3 py-2">
                Due date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline">
            {issues.map((issue) => (
              <tr
                key={issue.id}
                className={`text-xs hover:bg-surface-low ${
                  issue.status === "done" || issue.status === "cancelled"
                    ? "text-text-tertiary"
                    : ""
                }`}
              >
                <td className="px-3 py-2.5 align-top">
                  <input
                    type="checkbox"
                    aria-label={`Select ${issue.title}`}
                    className="size-3.5 accent-primary"
                  />
                </td>
                <td className="max-w-[360px] px-3 py-2.5 align-top">
                  <Link
                    href={`/${issue.workspaceSlug}/issues/${issue.id}`}
                    className={`font-medium hover:text-primary hover:underline ${
                      issue.status === "done" || issue.status === "cancelled"
                        ? "line-through"
                        : ""
                    }`}
                  >
                    {issue.title}
                  </Link>
                  <p className="mt-1 text-[11px] text-text-tertiary">{issue.workspaceName}</p>
                  {issue.labels.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {issue.labels.map((label) => (
                        <span
                          key={label}
                          className="border border-border-hairline bg-surface-low px-1.5 py-0.5 font-mono text-[9px] text-text-tertiary"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span
                    className={`inline-flex border px-1.5 py-0.5 font-mono text-[10px] uppercase ${STATUS_CLASSES[issue.status]}`}
                  >
                    {STATUS_LABELS[issue.status]}
                  </span>
                </td>
                <td className="px-3 py-2.5 align-top">
                  <PriorityIndicator priority={issue.priority} />
                </td>
                <td className="px-3 py-2.5 align-top text-text-secondary">{issue.projectName}</td>
                <td className="px-3 py-2.5 align-top">
                  {issue.dueDate ? (
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] ${
                        issue.isOverdue ? "text-status-urgent" : "text-text-secondary"
                      }`}
                    >
                      {issue.isOverdue ? <AlertCircle size={11} aria-hidden="true" /> : null}
                      {issue.dueDate}
                    </span>
                  ) : (
                    <span className="text-text-tertiary">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {issues.length === 0 ? (
          <div className="border-t border-border-hairline px-6 py-14 text-center">
            <h2 className="font-serif text-xl">No issues assigned to you</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Assigned issues from your workspaces will appear here.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
