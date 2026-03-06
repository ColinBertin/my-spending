import { describe, expect, it, vi } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("uses default styling when no color is provided", () => {
    const element = Button({ text: "Default" });

    expect(element.type).toBe("button");
    expect(element.props.className).toContain("bg-red-500");
  });

  it("uses variant styles for primary and secondary", () => {
    const primary = Button({ text: "Primary", color: "primary" });
    const secondary = Button({ text: "Secondary", color: "secondary" });

    expect(primary.props.className).toContain("bg-blue-dark");
    expect(secondary.props.className).toContain("bg-orange-dark");
  });

  it("prefers handleChange over onClick", () => {
    const handleChange = vi.fn();
    const onClick = vi.fn();

    const element = Button({
      text: "Click",
      handleChange,
      onClick,
    });

    element.props.onClick({} as never);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
