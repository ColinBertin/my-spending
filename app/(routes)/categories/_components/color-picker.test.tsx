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
import { colorCodes } from "@/helpers";
import ColorPicker from "./color-picker";

function Harness({
  defaultValues,
  onSubmit,
  error,
}: {
  defaultValues?: Partial<Category>;
  onSubmit: (values: Category) => void;
  error?: string;
}) {
  const { register, handleSubmit } = useForm<Category>({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ColorPicker register={register} error={error} />
      <button type="submit">submit</button>
    </form>
  );
}

function radio(name: string) {
  return screen.getByRole("radio", { name }) as HTMLInputElement;
}

describe("ColorPicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders one swatch per colour code in a 'Colour' group", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Colour" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(
      Object.keys(colorCodes).length,
    );
  });

  it("paints each swatch with its colour", () => {
    render(<Harness onSubmit={vi.fn()} />);

    const swatch = radio("rose").closest("label") as HTMLElement;
    // jsdom normalises hex to rgb()
    expect(swatch.style.backgroundColor).toBe("rgb(254, 226, 226)");
  });

  it("checks the colour of an existing category", () => {
    render(<Harness defaultValues={{ color: "coral" }} onSubmit={vi.fn()} />);

    expect(radio("coral").checked).toBe(true);
    expect(radio("rose").checked).toBe(false);
  });

  it("submits the picked colour", async () => {
    const onSubmit = vi.fn();
    render(<Harness defaultValues={{ color: "rose" }} onSubmit={onSubmit} />);

    fireEvent.click(radio("coral"));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ color: "coral" });
  });

  it("shows no error by default and the message when passed one", () => {
    const { rerender } = render(<Harness onSubmit={vi.fn()} />);
    expect(screen.queryByRole("alert")).toBeNull();

    rerender(<Harness onSubmit={vi.fn()} error="Invalid color" />);
    expect(screen.getByRole("alert").textContent).toContain("Invalid color");
  });
});
