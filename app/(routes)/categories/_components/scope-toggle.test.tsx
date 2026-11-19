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
import type { Category } from "@/types";
import ScopeToggle from "./scope-toggle";

function Harness({
  defaultValues,
  onSubmit,
  error,
  disabled,
}: {
  defaultValues?: Partial<Category>;
  onSubmit: (values: Category) => void;
  error?: string;
  disabled?: boolean;
}) {
  const { register, handleSubmit } = useForm<Category>({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ScopeToggle register={register} error={error} disabled={disabled} />
      <button type="submit">submit</button>
    </form>
  );
}

function radio(name: string) {
  return screen.getByRole("radio", { name }) as HTMLInputElement;
}

describe("ScopeToggle", () => {
  afterEach(() => {
    cleanup();
  });

  it("offers Normal and Professional in a 'Scope' group with a hint", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Scope" })).toBeTruthy();
    expect(radio("Normal").value).toBe("normal");
    expect(radio("Professional").value).toBe("professional");
    expect(screen.getByText(/元帳 exports/)).toBeTruthy();
  });

  it("checks the scope of an existing category", () => {
    render(
      <Harness defaultValues={{ type: "professional" }} onSubmit={vi.fn()} />,
    );

    expect(radio("Professional").checked).toBe(true);
    expect(radio("Normal").checked).toBe(false);
  });

  it("submits the picked scope", async () => {
    const onSubmit = vi.fn();
    render(<Harness defaultValues={{ type: "normal" }} onSubmit={onSubmit} />);

    fireEvent.click(radio("Professional"));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ type: "professional" });
  });

  it("locks both scopes and explains why when disabled", () => {
    render(
      <Harness
        defaultValues={{ type: "professional" }}
        onSubmit={vi.fn()}
        disabled
      />,
    );

    expect(radio("Normal").matches(":disabled")).toBe(true);
    expect(radio("Professional").matches(":disabled")).toBe(true);
    expect(radio("Professional").checked).toBe(true);
    expect(screen.getByText(/can't be changed/)).toBeTruthy();
  });

  it("still submits the existing scope when disabled", async () => {
    const onSubmit = vi.fn();
    render(
      <Harness
        defaultValues={{ type: "professional" }}
        onSubmit={onSubmit}
        disabled
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ type: "professional" });
  });

  it("blocks submit when no scope is picked", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows the error message passed in", () => {
    render(<Harness onSubmit={vi.fn()} error="Scope is required" />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Scope is required",
    );
  });
});
