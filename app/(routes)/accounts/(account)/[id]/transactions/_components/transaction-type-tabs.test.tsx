// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Transaction } from "@/types";
import TransactionTypeTabs from "./transaction-type-tabs";

function Harness({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<Transaction>;
  onSubmit: (values: Transaction) => void;
}) {
  const { register, handleSubmit } = useForm<Transaction>({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TransactionTypeTabs register={register} />
      <button type="submit">submit</button>
    </form>
  );
}

function radio(name: string) {
  return screen.getByRole("radio", { name }) as HTMLInputElement;
}

describe("TransactionTypeTabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("offers Expense and Income in a 'Type' group", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Type" })).toBeTruthy();
    expect(radio("Expense").value).toBe("expense");
    expect(radio("Income").value).toBe("income");
  });

  it("checks the default type", () => {
    render(<Harness defaultValues={{ type: "expense" }} onSubmit={vi.fn()} />);

    expect(radio("Expense").checked).toBe(true);
    expect(radio("Income").checked).toBe(false);
  });

  it("submits the picked type", async () => {
    const onSubmit = vi.fn();
    render(<Harness defaultValues={{ type: "expense" }} onSubmit={onSubmit} />);

    fireEvent.click(radio("Income"));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ type: "income" });
  });

  it("underlines each tab in its own colour when active", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(radio("Expense").closest("label")?.className).toContain(
      "has-checked:after:bg-brand",
    );
    expect(radio("Income").closest("label")?.className).toContain(
      "has-checked:after:bg-positive",
    );
  });
});
