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
import type { Account } from "@/types";
import CurrencyPicker, { CURRENCIES } from "./currency-picker";

function Harness({
  defaultValues,
  onSubmit,
  error,
}: {
  defaultValues?: Partial<Account>;
  onSubmit: (values: Account) => void;
  error?: string;
}) {
  const { register, handleSubmit } = useForm<Account>({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CurrencyPicker register={register} error={error} />
      <button type="submit">submit</button>
    </form>
  );
}

function radio(name: string) {
  return screen.getByRole("radio", { name }) as HTMLInputElement;
}

describe("CurrencyPicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("offers every currency with its symbol in a 'Currency' group", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Currency" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(CURRENCIES.length);
    for (const currency of CURRENCIES) {
      expect(radio(`${currency.symbol} ${currency.code}`).value).toBe(
        currency.code,
      );
    }
  });

  it("checks the default currency", () => {
    render(<Harness defaultValues={{ currency: "EUR" }} onSubmit={vi.fn()} />);

    expect(radio("€ EUR").checked).toBe(true);
    expect(radio("¥ JPY").checked).toBe(false);
    expect(radio("$ USD").checked).toBe(false);
  });

  it("submits the picked currency", async () => {
    const onSubmit = vi.fn();
    render(<Harness defaultValues={{ currency: "JPY" }} onSubmit={onSubmit} />);

    fireEvent.click(radio("$ USD"));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ currency: "USD" });
  });

  it("blocks submit when no currency is picked", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows no error by default", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows the error message passed in", () => {
    render(<Harness onSubmit={vi.fn()} error="Currency is required" />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Currency is required",
    );
  });
});
