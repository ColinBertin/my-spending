// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AuthField } from "./auth-ui";

describe("AuthField", () => {
  afterEach(() => {
    cleanup();
  });

  it("has no toggle on non-password fields", () => {
    render(<AuthField id="email" label="Email" type="email" />);

    expect(screen.getByLabelText("Email").getAttribute("type")).toBe("email");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
