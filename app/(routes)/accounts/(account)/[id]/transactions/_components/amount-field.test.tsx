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
import AmountField from "./amount-field";

function Harness({
  defaultValues,
  onSubmit,
  error,
  currencySymbol = "¥",
}: {
  defaultValues?: Partial<Transaction>;
  onSubmit: (values: Transaction) => void;
  error?: string;
  currencySymbol?: string;
}) {
  const { register, handleSubmit } = useForm<Transaction>({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AmountField
        register={register}
        currencySymbol={currencySymbol}
        error={error}
      />
      <button type="submit">submit</button>
    </form>
  );
}

async function submitAndSettle() {
  fireEvent.click(screen.getByRole("button", { name: "submit" }));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("AmountField", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a labelled numeric amount input and the currency symbol", () => {
    render(<Harness onSubmit={vi.fn()} currencySymbol="€" />);

    const amount = screen.getByLabelText("Amount") as HTMLInputElement;
    expect(amount.type).toBe("number");
    expect(amount.inputMode).toBe("decimal");
    expect(screen.getByText("€")).toBeTruthy();
  });

  it("offers every currency and selects the default one", () => {
    render(<Harness defaultValues={{ currency: "EUR" }} onSubmit={vi.fn()} />);

    const select = screen.getByLabelText("Currency") as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).toEqual([
      "JPY",
      "EUR",
      "USD",
    ]);
    expect(select.value).toBe("EUR");
  });

  it("submits the amount and the picked currency", async () => {
    const onSubmit = vi.fn();
    render(<Harness defaultValues={{ currency: "JPY" }} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "1250" },
    });
    fireEvent.change(screen.getByLabelText("Currency"), {
      target: { value: "USD" },
    });
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      amount: "1250",
      currency: "USD",
    });
  });

  it("blocks submit without an amount", async () => {
    const onSubmit = vi.fn();
    render(<Harness defaultValues={{ currency: "JPY" }} onSubmit={onSubmit} />);

    await submitAndSettle();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit for zero", async () => {
    const onSubmit = vi.fn();
    render(<Harness defaultValues={{ currency: "JPY" }} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "0" },
    });
    await submitAndSettle();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows the error, marks the input invalid and reddens the underline", () => {
    const { container } = render(
      <Harness onSubmit={vi.fn()} error="Amount is required" />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Amount is required",
    );
    expect(screen.getByLabelText("Amount").getAttribute("aria-invalid")).toBe(
      "true",
    );
    expect(container.querySelector(".border-negative")).not.toBeNull();
  });

  it("shows no error by default", () => {
    const { container } = render(<Harness onSubmit={vi.fn()} />);

    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.querySelector(".border-negative")).toBeNull();
  });
});
