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
import type { Category, Transaction } from "@/types";
import CategoryChips from "./category-chips";

const CATEGORIES: Category[] = [
  { id: "cat-food", name: "Food" },
  { id: "cat-rent", name: "Rent" },
];

function Harness({
  categories = CATEGORIES,
  defaultValues,
  onSubmit,
  error,
}: {
  categories?: Category[];
  defaultValues?: Partial<Transaction>;
  onSubmit: (values: Transaction) => void;
  error?: string;
}) {
  const { register, handleSubmit } = useForm<Transaction>({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CategoryChips
        register={register}
        categories={categories}
        error={error}
      />
      <button type="submit">submit</button>
    </form>
  );
}

function radio(name: string) {
  return screen.getByRole("radio", { name }) as HTMLInputElement;
}

describe("CategoryChips", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders one chip per category in a 'Category' group", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Category" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(radio("Food").value).toBe("cat-food");
    expect(radio("Rent").value).toBe("cat-rent");
  });

  it("checks the default category", () => {
    render(
      <Harness
        defaultValues={{ category_id: "cat-rent" }}
        onSubmit={vi.fn()}
      />,
    );

    expect(radio("Rent").checked).toBe(true);
    expect(radio("Food").checked).toBe(false);
  });

  it("submits the picked category id", async () => {
    const onSubmit = vi.fn();
    render(
      <Harness
        defaultValues={{ category_id: "cat-food" }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(radio("Rent"));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      category_id: "cat-rent",
    });
  });

  it("blocks submit when no category is picked", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("links to category creation when there are none", () => {
    render(<Harness categories={[]} onSubmit={vi.fn()} />);

    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(
      screen.getByRole("link", { name: "Create one" }).getAttribute("href"),
    ).toBe("/categories/create");
  });

  it("shows the error passed in", () => {
    render(<Harness onSubmit={vi.fn()} error="Category is required" />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Category is required",
    );
  });
});
