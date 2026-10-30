import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

import { AllProjectsDirectory } from "./AllProjectsDirectory";

describe("AllProjectsDirectory", () => {
  it("renders the read-only cross-workspace directory", () => {
    render(<AllProjectsDirectory />);

    expect(screen.getByRole("heading", { name: "All Projects" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search projects by name" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No projects yet" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /New Project/ })).not.toBeInTheDocument();
  });

  it("renders approved workspace and project fields", async () => {
    const { container } = render(
      <AllProjectsDirectory
        workspaces={[
          {
            id: "workspace-1",
            name: "Acme Engineering",
            projectCount: 1,
            issueCount: 4,
            openCount: 2,
            urgentCount: 1,
            projects: [
              {
                id: "project-1",
                name: "Platform",
                description: "Core engineering work",
                issueCount: 4,
                openCount: 2,
                urgentCount: 1,
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Acme Engineering" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Platform" })).toBeInTheDocument();
    expect(screen.getByText("4 issues")).toBeInTheDocument();
    expect(screen.getByText("2 open")).toBeInTheDocument();
    expect(screen.getByText("1 urgent")).toBeInTheDocument();
    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });
});
