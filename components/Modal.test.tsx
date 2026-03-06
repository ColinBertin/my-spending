import { describe, expect, it, vi } from "vitest";
import Modal, { ModalTitleText } from "./Modal";

describe("Modal", () => {
  it("uses the shared wrapper classes by default", () => {
    const element = Modal({
      open: true,
      onClose: vi.fn(),
      children: "Body",
    });

    expect(element.props.className).toContain("relative");
    expect(element.props.className).toContain("z-50");
  });

  it("merges custom classes into the wrapper and panel", () => {
    const element = Modal({
      open: true,
      onClose: vi.fn(),
      children: "Body",
      className: "print-hidden",
      panelClassName: "max-w-2xl",
    });

    const layout = Array.isArray(element.props.children)
      ? element.props.children[1]
      : element.props.children;
    const panel = layout.props.children;

    expect(element.props.className).toContain("print-hidden");
    expect(panel.props.className).toContain("max-w-2xl");
    expect(panel.props.className).toContain("rounded-2xl");
  });
});

describe("ModalTitleText", () => {
  it("applies the shared title styling", () => {
    const element = ModalTitleText({
      children: "Delete Account",
      className: "text-red",
    });

    expect(element.props.className).toContain("text-xl");
    expect(element.props.className).toContain("font-semibold");
    expect(element.props.className).toContain("text-red");
  });
});
