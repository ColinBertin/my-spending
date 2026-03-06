import { describe, expect, it, vi } from "vitest";
import Button from "./Button";
import ModalDetailsContent from "./ModalDetailsContent";

function findAll(
  node: unknown,
  predicate: (element: {
    type?: unknown;
    props?: { children?: unknown };
  }) => boolean,
): Array<{ type?: unknown; props?: { children?: unknown } }> {
  const results: Array<{ type?: unknown; props?: { children?: unknown } }> = [];

  const visit = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value !== "object") return;

    const element = value as { type?: unknown; props?: { children?: unknown } };
    if (predicate(element)) {
      results.push(element);
    }
    visit(element.props?.children);
  };

  visit(node);
  return results;
}

describe("ModalDetailsContent", () => {
  it("wires text confirmation and button handlers", () => {
    const setConfirmValue = vi.fn();
    const closeDialog = vi.fn();
    const handleDelete = vi.fn();

    const element = ModalDetailsContent({
      rows: [{ label: "Title", value: "Rent" }],
      confirmValue: "Something else",
      setConfirmValue,
      confirmTarget: "Rent",
      closeDialog,
      isSaving: false,
      handleDelete,
    });

    const textInput = findAll(
      element,
      (item) =>
        item.type === "input" &&
        (item.props as { type?: string })?.type === "text",
    )[0];
    expect(textInput).toBeTruthy();

    (
      textInput.props as {
        onChange: (event: { target: { value: string } }) => void;
      }
    ).onChange({ target: { value: "Rent" } });
    expect(setConfirmValue).toHaveBeenCalledWith("Rent");

    const actionButtons = findAll(element, (item) => item.type === Button);
    expect(actionButtons).toHaveLength(2);
    expect(
      (actionButtons[0].props as { handleChange: () => void }).handleChange,
    ).toBe(closeDialog);
    expect(
      (actionButtons[1].props as { handleChange: () => void }).handleChange,
    ).toBe(handleDelete);
    expect((actionButtons[1].props as { disabled: boolean }).disabled).toBe(
      true,
    );
  });

  it("requires warning confirmation when warning is provided", () => {
    const onWarningChange = vi.fn();

    const elementUnchecked = ModalDetailsContent({
      rows: [{ label: "Account", value: "Family" }],
      confirmValue: "Family",
      setConfirmValue: vi.fn(),
      confirmTarget: "Family",
      closeDialog: vi.fn(),
      isSaving: false,
      handleDelete: vi.fn(),
      warning: {
        message: "Permanent action.",
        checkboxLabel: "I understand.",
        checked: false,
        onChange: onWarningChange,
      },
    });

    const checkbox = findAll(
      elementUnchecked,
      (item) =>
        item.type === "input" &&
        (item.props as { type?: string })?.type === "checkbox",
    )[0];
    expect(checkbox).toBeTruthy();

    (
      checkbox.props as {
        onChange: (event: { target: { checked: boolean } }) => void;
      }
    ).onChange({ target: { checked: true } });
    expect(onWarningChange).toHaveBeenCalledWith(true);

    const uncheckedButtons = findAll(
      elementUnchecked,
      (item) => item.type === Button,
    );
    expect((uncheckedButtons[1].props as { disabled: boolean }).disabled).toBe(
      true,
    );

    const elementChecked = ModalDetailsContent({
      rows: [{ label: "Account", value: "Family" }],
      confirmValue: "Family",
      setConfirmValue: vi.fn(),
      confirmTarget: "Family",
      closeDialog: vi.fn(),
      isSaving: false,
      handleDelete: vi.fn(),
      warning: {
        message: "Permanent action.",
        checkboxLabel: "I understand.",
        checked: true,
        onChange: vi.fn(),
      },
    });

    const checkedButtons = findAll(
      elementChecked,
      (item) => item.type === Button,
    );
    expect((checkedButtons[1].props as { disabled: boolean }).disabled).toBe(
      false,
    );
  });
});
