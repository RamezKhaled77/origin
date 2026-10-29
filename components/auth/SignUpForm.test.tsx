import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";

import { SignUpForm } from "./SignUpForm";

describe("SignUpForm", () => {
  it("renders the account fields without excluded signup controls", () => {
    render(<SignUpForm />);

    expect(screen.getByRole("textbox", { name: "Full name" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: "Work email" })).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.getByLabelText("Confirm password")).toBeRequired();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/workspace handle/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /github|google/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
  });

  it("toggles each password field independently", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const password = screen.getByLabelText("Password");
    const confirmation = screen.getByLabelText("Confirm password");

    await user.click(screen.getAllByRole("button", { name: "Show password" })[0]);
    expect(password).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(confirmation).toHaveAttribute("type", "text");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SignUpForm />);

    expect((await axe(container)).violations).toHaveLength(0);
  });
});
