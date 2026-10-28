import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";

import { Button } from "./button";

describe("Button", () => {
  it("renders its label and has no accessibility violations", async () => {
    const { container } = render(<Button>New Issue</Button>);

    expect(screen.getByRole("button", { name: "New Issue" })).toBeInTheDocument();

    expect((await axe(container)).violations).toHaveLength(0);
  });
});
