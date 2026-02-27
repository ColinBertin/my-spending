import { Children } from "react";
import ColorPicker from "./ColorPicker";

const colors = {
  rose: "#FEE2E2",
  ocean: "#2563EB",
} as const;

describe("ColorPicker", () => {
  it("calls onChange with clicked color code", () => {
    const onChange = vi.fn();
    const element = ColorPicker({
      value: "",
      onChange,
      colors: colors as never,
    });

    const wrappers = Children.toArray(element.props.children);
    const firstButton = (
      wrappers[0] as { props: { children: { props: { onClick: () => void } } } }
    ).props.children;

    firstButton.props.onClick();

    expect(onChange).toHaveBeenCalledWith("rose");
  });

  it("adds selected style for the active color", () => {
    const element = ColorPicker({
      value: "ocean",
      onChange: vi.fn(),
      colors: colors as never,
    });

    const wrappers = Children.toArray(element.props.children);
    const secondWrapper = wrappers[1] as { props: { className: string } };

    expect(secondWrapper.props.className).toContain("border-black");
  });
});
