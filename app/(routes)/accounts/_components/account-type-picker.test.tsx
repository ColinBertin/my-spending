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
import AccountTypePicker, { ACCOUNT_TYPES } from "./account-type-picker";

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
      <AccountTypePicker register={register} error={error} />
      <button type="submit">submit</button>
    </form>
  );
}

function radio(name: RegExp) {
  return screen.getByRole("radio", { name }) as HTMLInputElement;
}

describe("AccountTypePicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("offers every account type with its description in a 'Type' group", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Type" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(ACCOUNT_TYPES.length);
    for (const accountType of ACCOUNT_TYPES) {
      expect(radio(new RegExp(`^${accountType.name}`)).value).toBe(
        accountType.id,
      );
      expect(screen.getByText(accountType.description)).toBeTruthy();
    }
  });

  it("checks the default type", () => {
    render(<Harness defaultValues={{ type: "shared" }} onSubmit={vi.fn()} />);

    expect(radio(/^Shared/).checked).toBe(true);
    expect(radio(/^Single/).checked).toBe(false);
    expect(radio(/^Professional/).checked).toBe(false);
  });

  it("submits the picked type", async () => {
    const onSubmit = vi.fn();
    render(<Harness defaultValues={{ type: "single" }} onSubmit={onSubmit} />);

    fireEvent.click(radio(/^Professional/));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ type: "professional" });
  });

  it("blocks submit when no type is picked", async () => {
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
    render(<Harness onSubmit={vi.fn()} error="Type is required" />);

    expect(screen.getByRole("alert").textContent).toContain("Type is required");
  });
});
