import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

import { MyIssuesDirectory } from "./MyIssuesDirectory";

const issues = [
  {
    id: "issue-1",
    title: "Fix payment retry behavior",
    workspaceSlug: "acme-engineering",
    workspaceName: "Acme Engineering",
    projectName: "E-commerce Platform",
    status: "in_progress" as const,
    priority: "urgent" as const,
    labels: ["payments"],
    dueDate: "Today",
    isOverdue: false,
  },
  {
    id: "issue-2",
    title: "Document API errors",
    workspaceSlug: "labs-incubation",
    workspaceName: "Labs & Incubation",
    projectName: "Collaboration",
    status: "done" as const,
    priority: "no_priority" as const,
    labels: [],
    dueDate: null,
    isOverdue: false,
  },
];

describe("MyIssuesDirectory", () => {
  it("renders the approved My Issues summary and filters", () => {
    render(<MyIssuesDirectory issues={issues} />);

    expect(screen.getByRole("heading", { name: "My Issues" })).toBeInTheDocument();
    expect(screen.getByText("Assigned")).toBeInTheDocument();
    expect(screen.getAllByText("In progress")).not.toHaveLength(0);
    expect(screen.getByText("Urgent / high")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search my issues" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bulk actions/ })).toBeInTheDocument();
    expect(screen.queryByText(/Sprint|Export|Create Task|Save as view/)).not.toBeInTheDocument();
  });

  it("renders issue rows without issue keys and remains accessible", async () => {
    const { container } = render(<MyIssuesDirectory issues={issues} />);

    expect(screen.getByRole("link", { name: "Fix payment retry behavior" })).toHaveAttribute(
      "href",
      "/acme-engineering/issues/issue-1",
    );
    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText(/No priority/)).toBeInTheDocument();
    expect(screen.queryByText(/ENG-|#issue/)).not.toBeInTheDocument();

    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });
});
