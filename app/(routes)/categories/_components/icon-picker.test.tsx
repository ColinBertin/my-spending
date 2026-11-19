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
import IconPicker from "./icon-picker";

function Harness({
  defaultValues,
  onSubmit,
  error,
}: {
  defaultValues?: Partial<Category>;
  onSubmit: (values: Category) => void;
  error?: string;
}) {
  const { control, setValue, handleSubmit } = useForm<Category>({
    defaultValues,
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <IconPicker
        control={control}
        setValue={setValue}
        hex="#F87171"
        error={error}
      />
      <button type="submit">submit</button>
    </form>
  );
}

describe("IconPicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the icons as radios in an 'Icon' group", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Icon" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "HiShoppingBag" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "FaCoffee" })).toBeTruthy();
  });

  it("checks the icon of an existing category", () => {
    render(
      <Harness
        defaultValues={{ icon: "HiSun", icon_pack: "hi" }}
        onSubmit={vi.fn()}
      />,
    );

    const sun = screen.getByRole("radio", { name: "HiSun" });
    const bag = screen.getByRole("radio", { name: "HiShoppingBag" });
    expect((sun as HTMLInputElement).checked).toBe(true);
    expect((bag as HTMLInputElement).checked).toBe(false);
  });

  it("sets both icon and icon_pack when an icon is picked", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("radio", { name: "FaCoffee" }));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      icon: "FaCoffee",
      icon_pack: "fa",
    });
  });

  it("switches icon_pack when moving to an icon from another pack", async () => {
    const onSubmit = vi.fn();
    render(
      <Harness
        defaultValues={{ icon: "FaCoffee", icon_pack: "fa" }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "HiSun" }));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      icon: "HiSun",
      icon_pack: "hi",
    });
  });

  it("blocks submit until an icon is picked", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    // give react-hook-form a tick to run validation
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("tints the selected icon with a darkened category colour", () => {
    const { container } = render(<Harness onSubmit={vi.fn()} />);

    const grid = container.querySelector<HTMLElement>(
      "[style*='--category-accent']",
    );
    expect(grid?.style.getPropertyValue("--category-accent")).not.toBe("");
  });

  it("shows the error message passed in", () => {
    render(<Harness onSubmit={vi.fn()} error="Pick an icon" />);

    expect(screen.getByRole("alert").textContent).toContain("Pick an icon");
  });
});
