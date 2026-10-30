import { render, screen } from "@testing-library/react";

import { GlobalSidebar } from "./GlobalSidebar";

describe("GlobalSidebar", () => {
  it("marks the current global route and does not add excluded navigation", () => {
    render(<GlobalSidebar userName="Ramez Khaled" />);

    expect(screen.getByRole("link", { name: "Workspaces" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByText("Ramez Khaled")).toBeInTheDocument();
    expect(screen.queryByText("Documentation")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });
});
