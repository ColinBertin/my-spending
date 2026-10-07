import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateCategory from "./create-category";

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
  useForm: () => ({
    register: () => ({}),
    handleSubmit: (cb: (values: Record<string, unknown>) => Promise<void>) => {
      submitHandler = cb;
      return () => undefined;
    },
    setValue: setValueMock,
    control: {},
    formState: { errors: {} },
  }),
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

function makeFetchResponse(ok: boolean, jsonValue: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(jsonValue),
  };
}

describe("CreateCategory", () => {
  const fetchMock = vi.fn();
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    submitHandler = null;
    watchedValues = {};
    iconFieldOnChange = vi.fn();
    pushMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(makeFetchResponse(true, {}));
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    consoleErrorSpy.mockRestore();
  });

  it("renders the form fields, buttons and phone back link", () => {
    const html = renderToStaticMarkup(<CreateCategory />);

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
    const html = renderToStaticMarkup(<CreateCategory />);

    for (const value of ["normal", "professional"]) {
      expect(html).toContain(`type="radio" class="sr-only" value="${value}"`);
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
    const html = renderToStaticMarkup(<CreateCategory />);

    expect(html).toContain("Groceries");
    expect(html).toContain("GROCERIES");
    expect(html).toContain('name="icon" checked="" value="HiShoppingBag"');
    expect(html).not.toContain('name="icon" checked="" value="HiBolt"');
  });

  it("falls back to a placeholder preview name", () => {
    const html = renderToStaticMarkup(<CreateCategory />);

    expect(html).toContain("Category name");
  });

  it("submits category and redirects to the categories list", async () => {
    renderToStaticMarkup(<CreateCategory />);
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
    renderToStaticMarkup(<CreateCategory />);

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
});
