import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateUpdateCategory from "./create-update-category";
import type { Category } from "@/types";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [false, (cb: () => void) => cb()] as const,
  };
});

const pushMock = vi.fn();
const backMock = vi.fn();
const setValueMock = vi.fn();
const showSuccessNotificationMock = vi.fn();
const showErrorNotificationMock = vi.fn();

let submitHandler: ((values: Record<string, unknown>) => Promise<void>) | null =
  null;
let watchedValues: Record<string, string | undefined> = {};
let iconFieldOnChange = vi.fn();
let useFormOptions: { defaultValues?: unknown } | undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
}));

vi.mock("@/components/ui/NotificationProvider", () => ({
  useSuccessNotification: () => showSuccessNotificationMock,
  useErrorNotification: () => showErrorNotificationMock,
}));

vi.mock("react-hook-form", () => ({
  useForm: (options: { defaultValues?: unknown }) => {
    useFormOptions = options;
    return {
      register: () => ({}),
      handleSubmit: (
        cb: (values: Record<string, unknown>) => Promise<void>,
      ) => {
        submitHandler = cb;
        return () => undefined;
      },
      setValue: setValueMock,
      control: {},
      formState: { errors: {} },
    };
  },
  useWatch: ({ name }: { name: string }) => watchedValues[name],
  Controller: ({
    name,
    render,
  }: {
    name: string;
    render: (params: {
      field: {
        name: string;
        value: string | undefined;
        onChange: (...event: unknown[]) => void;
        onBlur: () => void;
      };
    }) => ReactNode;
  }) =>
    render({
      field: {
        name,
        value: watchedValues[name],
        onChange: iconFieldOnChange,
        onBlur: vi.fn(),
      },
    }),
}));

const newCategory: Category = { id: "", name: "", type: "normal" };

const existingCategory: Category = {
  id: "cat-123",
  name: "Groceries",
  type: "professional",
  color: "rose",
  icon: "HiShoppingBag",
  icon_pack: "hi",
};

function makeFetchResponse(ok: boolean, jsonValue: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(jsonValue),
  };
}

describe("CreateUpdateCategory", () => {
  const fetchMock = vi.fn();
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    submitHandler = null;
    useFormOptions = undefined;
    watchedValues = {};
    iconFieldOnChange = vi.fn();
    pushMock.mockReset();
    fetchMock.mockReset();
    showSuccessNotificationMock.mockReset();
    showErrorNotificationMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(makeFetchResponse(true, {}));
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    consoleErrorSpy.mockRestore();
  });

  it("renders the form fields, buttons and phone back link", () => {
    const html = renderToStaticMarkup(
      <CreateUpdateCategory mode="create" category={newCategory} />,
    );

    expect(html).toContain("New category");
    expect(html).toContain("Name");
    expect(html).toContain("Scope");
    expect(html).toContain("Colour");
    expect(html).toContain("Icon");
    expect(html).toContain("Save category");
    expect(html).toContain("Cancel");
    expect(html).toContain('href="/categories"');
    expect(html).toContain("← Categories");
  });

  it("offers both scopes, every colour code and finance icons as radios", () => {
    const html = renderToStaticMarkup(
      <CreateUpdateCategory mode="create" category={newCategory} />,
    );

    for (const value of ["normal", "professional"]) {
      expect(html).toMatch(
        new RegExp(
          `<input type="radio"[^>]*class="sr-only"[^>]*value="${value}"`,
        ),
      );
    }
    for (const value of ["rose", "coral", "mint"]) {
      expect(html).toContain(`aria-label="${value}"`);
    }
    expect(html).toContain('name="icon" value="HiShoppingBag"');
  });

  it("previews the watched name and marks the selected icon", () => {
    watchedValues = {
      name: "Groceries",
      color: "rose",
      icon: "HiShoppingBag",
      icon_pack: "hi",
    };
    const html = renderToStaticMarkup(
      <CreateUpdateCategory mode="create" category={newCategory} />,
    );

    expect(html).toContain("Groceries");
    expect(html).toContain("GROCERIES");
    expect(html).toContain('name="icon" checked="" value="HiShoppingBag"');
    expect(html).not.toContain('name="icon" checked="" value="HiBolt"');
  });

  it("falls back to a placeholder preview name", () => {
    const html = renderToStaticMarkup(
      <CreateUpdateCategory mode="create" category={newCategory} />,
    );

    expect(html).toContain("Category name");
  });

  it("submits category and redirects to the categories list", async () => {
    renderToStaticMarkup(
      <CreateUpdateCategory mode="create" category={newCategory} />,
    );
    expect(submitHandler).not.toBeNull();

    await submitHandler?.({
      name: "Food",
      type: "professional",
      color: "rose",
      icon: "HiCoffee",
      icon_pack: "hi",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/categories",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload).toEqual({
      name: "Food",
      type: "professional",
      color: "rose",
      icon: "HiCoffee",
      icon_pack: "hi",
    });
    expect(showSuccessNotificationMock).toHaveBeenCalledWith(
      "Category created !",
    );
    expect(pushMock).toHaveBeenCalledWith("/categories");
  });

  it("shows an error notification on failure", async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchResponse(false, { error: "boom" }),
    );
    renderToStaticMarkup(
      <CreateUpdateCategory mode="create" category={newCategory} />,
    );

    await submitHandler?.({
      name: "Food",
      type: "normal",
      color: "rose",
      icon: "HiCoffee",
      icon_pack: "hi",
    });

    expect(showErrorNotificationMock).toHaveBeenCalledWith(
      "Failed to create category",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  describe("update mode", () => {
    it("shows the update heading instead of the create one", () => {
      const html = renderToStaticMarkup(
        <CreateUpdateCategory mode="update" category={existingCategory} />,
      );

      expect(html).toContain("Update category");
      expect(html).not.toContain("New category");
    });

    it("locks the name of a professional category", () => {
      const html = renderToStaticMarkup(
        <CreateUpdateCategory mode="update" category={existingCategory} />,
      );

      expect(html).toMatch(/<input[^>]*id="category-name"[^>]*readOnly=""/);
      expect(html).toContain("can&#x27;t be renamed");
    });

    it("keeps the name editable for a normal category", () => {
      const html = renderToStaticMarkup(
        <CreateUpdateCategory
          mode="update"
          category={{ ...existingCategory, type: "normal" }}
        />,
      );

      expect(html).not.toMatch(/readOnly=""/);
      expect(html).not.toContain("be renamed");
    });

    it("prefills the form with the existing category", () => {
      renderToStaticMarkup(
        <CreateUpdateCategory mode="update" category={existingCategory} />,
      );

      expect(useFormOptions?.defaultValues).toEqual(existingCategory);
    });

    it("renders an existing category that has no colour or icon", () => {
      const bare: Category = { id: "cat-456", name: "Misc", type: "normal" };
      watchedValues = { name: "Misc" };

      const html = renderToStaticMarkup(
        <CreateUpdateCategory mode="update" category={bare} />,
      );

      expect(html).toContain("Misc");
      expect(html).not.toMatch(/name="icon" checked=""/);
    });

    it("sends a PUT with the category id and redirects", async () => {
      renderToStaticMarkup(
        <CreateUpdateCategory mode="update" category={existingCategory} />,
      );

      await submitHandler?.({ ...existingCategory, name: "Food" });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/categories",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }),
      );
      const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(payload).toMatchObject({ id: "cat-123", name: "Food" });
      expect(showSuccessNotificationMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith("/categories");
    });

    it("leaves empty fields out of the payload", async () => {
      renderToStaticMarkup(
        <CreateUpdateCategory
          mode="update"
          category={{ id: "cat-456", name: "Misc", type: "normal" }}
        />,
      );

      await submitHandler?.({
        id: "cat-456",
        name: "Misc",
        type: "normal",
        color: null,
        icon: undefined,
        icon_pack: "",
      });

      const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(payload).toEqual({ id: "cat-456", name: "Misc", type: "normal" });
    });

    it("never POSTs in update mode", async () => {
      renderToStaticMarkup(
        <CreateUpdateCategory mode="update" category={existingCategory} />,
      );

      await submitHandler?.(
        existingCategory as unknown as Record<string, unknown>,
      );

      expect(fetchMock.mock.calls[0][1].method).not.toBe("POST");
    });

    it("shows an error and stays on the page when the update is rejected (e.g. 404)", async () => {
      fetchMock.mockResolvedValueOnce(
        makeFetchResponse(false, { error: "Category not found" }),
      );
      renderToStaticMarkup(
        <CreateUpdateCategory mode="update" category={existingCategory} />,
      );

      await submitHandler?.(
        existingCategory as unknown as Record<string, unknown>,
      );

      expect(showErrorNotificationMock).toHaveBeenCalledTimes(1);
      expect(showSuccessNotificationMock).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Category not found");
    });

    it("handles a failed update whose body is not JSON", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
      });
      renderToStaticMarkup(
        <CreateUpdateCategory mode="update" category={existingCategory} />,
      );

      await expect(
        submitHandler?.(existingCategory as unknown as Record<string, unknown>),
      ).resolves.toBeUndefined();

      expect(showErrorNotificationMock).toHaveBeenCalledTimes(1);
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});
