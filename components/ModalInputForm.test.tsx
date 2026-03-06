import { describe, expect, it, vi } from "vitest";
import type { Category } from "@/types";
import Button from "./Button";
import ModalInputForm from "./ModalInputForm";

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

describe("ModalInputForm", () => {
  const categories: Category[] = [
    { id: "cat-food", name: "Food" },
    { id: "cat-salary", name: "Salary" },
  ];

  const baseValues = {
    title: "Groceries",
    type: "expense" as const,
    categoryId: "cat-food",
    amount: "1200",
    date: "2026-03-01",
    currency: "JPY" as const,
  };

  it("updates field values through state updaters", () => {
    const setValues = vi.fn();

    const element = ModalInputForm({
      values: baseValues,
      setValues,
      categories,
      isSaving: false,
      closeDialog: vi.fn(),
      handleSave: vi.fn(),
    });

    const textInput = findAll(
      element,
      (item) =>
        item.type === "input" &&
        (item.props as { type?: string })?.type === "text",
    )[0];
    (
      textInput.props as {
        onChange: (event: { target: { value: string } }) => void;
      }
    ).onChange({ target: { value: "Rent" } });

    const titleUpdater = setValues.mock.calls[0][0] as (
      current: typeof baseValues,
    ) => typeof baseValues;
    expect(titleUpdater(baseValues).title).toBe("Rent");

    const selects = findAll(element, (item) => item.type === "select");
    (
      selects[0].props as {
        onChange: (event: { target: { value: string } }) => void;
      }
    ).onChange({ target: { value: "income" } });

    const typeUpdater = setValues.mock.calls[1][0] as (
      current: typeof baseValues,
    ) => typeof baseValues;
    expect(typeUpdater(baseValues).type).toBe("income");
  });

  it("wires action buttons and disables them while saving", () => {
    const closeDialog = vi.fn();
    const handleSave = vi.fn();

    const element = ModalInputForm({
      values: baseValues,
      setValues: vi.fn(),
      categories,
      isSaving: true,
      closeDialog,
      handleSave,
    });

    const actionButtons = findAll(element, (item) => item.type === Button);
    expect(actionButtons).toHaveLength(2);
    expect(
      (actionButtons[0].props as { handleChange: () => void }).handleChange,
    ).toBe(closeDialog);
    expect(
      (actionButtons[1].props as { handleChange: () => void }).handleChange,
    ).toBe(handleSave);
    expect((actionButtons[0].props as { disabled: boolean }).disabled).toBe(
      true,
    );
    expect((actionButtons[1].props as { disabled: boolean }).disabled).toBe(
      true,
    );
  });
});
