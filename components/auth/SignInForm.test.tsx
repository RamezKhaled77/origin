import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";

import { SignInForm } from "./SignInForm";

describe("SignInForm", () => {
  it("renders the credential fields and account link", () => {
    render(<SignInForm />);

    expect(screen.getByRole("textbox", { name: "Email address" })).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SignInForm />);

    expect((await axe(container)).violations).toHaveLength(0);
  });
});
