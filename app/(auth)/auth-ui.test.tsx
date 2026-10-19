// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AuthField } from "./auth-ui";

describe("AuthField", () => {
  afterEach(() => {
    cleanup();
  });

  it("toggles a password field between hidden and visible", () => {
    render(<AuthField id="password" label="Password" type="password" />);
    const input = screen.getByLabelText("Password");

    expect(input.getAttribute("type")).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.getAttribute("type")).toBe("text");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input.getAttribute("type")).toBe("password");
  });

  it("has no toggle on non-password fields", () => {
    render(<AuthField id="email" label="Email" type="email" />);

    expect(screen.getByLabelText("Email").getAttribute("type")).toBe("email");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
