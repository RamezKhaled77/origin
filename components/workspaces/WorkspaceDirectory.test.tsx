import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

import { WorkspaceDirectory } from "./WorkspaceDirectory";

describe("WorkspaceDirectory", () => {
  it("renders the directory heading, search, and creation actions", () => {
    render(<WorkspaceDirectory />);

    expect(screen.getByRole("heading", { name: "Workspaces" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search workspaces by name" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /New Workspace/ })).toHaveLength(2);
  });

  it("provides an accessible empty state", async () => {
    const { container } = render(<WorkspaceDirectory />);

    expect(screen.getByRole("heading", { name: "No workspaces yet" })).toBeInTheDocument();
    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });

  it("renders workspace cards with contract-approved mock fields", () => {
    render(
      <WorkspaceDirectory
        workspaces={[
          {
            id: "workspace-1",
            name: "Acme Engineering",
            slug: "acme-engineering",
            description: "Engineering workspace",
            role: "owner",
            projectCount: 2,
            issueCount: 10,
            memberCount: 4,
            countsByStatus: {
              backlog: 1,
              todo: 2,
              in_progress: 1,
              in_review: 1,
              done: 4,
              cancelled: 1,
            },
            lastActivityAt: "5 minutes ago",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Acme Engineering" })).toBeInTheDocument();
    expect(screen.getByText("Engineering workspace")).toBeInTheDocument();
    expect(screen.getByText("owner")).toBeInTheDocument();
    expect(screen.getByText("Last activity 5 minutes ago")).toBeInTheDocument();
  });
});
