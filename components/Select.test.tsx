import { Children } from "react";
import { describe, expect, it, vi } from "vitest";
import Select from "./Select";

const options = [
  { id: "a", name: "Option A" },
  { id: "b", name: "Option B" },
];

describe("Select", () => {
  it("renders options and default value", () => {
    const element = Select({ defaultValue: "b", options });
    const children = Children.toArray(element.props.children);

    expect(element.type).toBe("select");
    expect(element.props.defaultValue).toBe("b");
    expect(children).toHaveLength(2);
    expect((children[0] as { props: { value: string } }).props.value).toBe("a");
    expect((children[1] as { props: { value: string } }).props.value).toBe("b");
  });

  it("prefers onChange over handleChange", () => {
    const onChange = vi.fn();
    const handleChange = vi.fn();
    const element = Select({
      defaultValue: "a",
      options,
      onChange,
      handleChange,
    });

    element.props.onChange({ target: { value: "b" } } as never);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("uses handleChange when onChange is missing", () => {
    const handleChange = vi.fn();
    const element = Select({ defaultValue: "a", options, handleChange });

    element.props.onChange({ target: { value: "b" } } as never);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
