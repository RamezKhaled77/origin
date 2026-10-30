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
});
