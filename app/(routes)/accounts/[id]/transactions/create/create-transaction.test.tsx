import { renderToStaticMarkup } from "react-dom/server";
import type { Category } from "@/types";
import CreateTransaction from "./create-transaction";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [false, (cb: () => void) => cb()] as const,
  };
});

const pushMock = vi.fn();
const backMock = vi.fn();
const showSuccessNotificationMock = vi.fn();
const showErrorNotificationMock = vi.fn();

let submitHandler: ((values: Record<string, unknown>) => Promise<void>) | null =
  null;

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
    control: {},
    formState: { errors: {} },
  }),
  Controller: ({
    render,
  }: {
    render: (params: {
      field: { value: Date; onChange: (...event: unknown[]) => void };
    }) => React.ReactNode;
  }) =>
    render({
      field: {
        value: new Date("2026-02-20T00:00:00.000Z"),
        onChange: vi.fn(),
      },
    }),
}));

vi.mock("@/components/Calendar", () => ({
  default: () => <div>Mock Calendar</div>,
}));

const categories: Category[] = [
  {
    id: "cat-1",
    name: "Food",
    color: "rose",
    icon: "HiCoffee",
    icon_pack: "hi",
    created_at: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "cat-2",
    name: "Salary",
    color: "ocean",
    icon: "HiCurrencyDollar",
    icon_pack: "hi",
    created_at: new Date("2026-01-01T00:00:00.000Z"),
  },
];

function makeFetchResponse(ok: boolean, jsonValue: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(jsonValue),
  };
}

describe("CreateTransaction", () => {
  const fetchMock = vi.fn();
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    submitHandler = null;
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(makeFetchResponse(true, {}));
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    consoleErrorSpy.mockRestore();
  });

  it("renders expected static form text", () => {
    const html = renderToStaticMarkup(
      <CreateTransaction accountId="acc-1" categories={categories} />,
    );

    expect(html).toContain("New Transaction");
    expect(html).toContain("Mock Calendar");
  });

  it("submits transaction and redirects on success", async () => {
    renderToStaticMarkup(
      <CreateTransaction accountId="acc-1" categories={categories} />,
    );
    expect(submitHandler).not.toBeNull();

    await submitHandler?.({
      title: "Salary payment",
      amount: "1500",
      note: "Monthly salary",
      category_id: "cat-2",
      type: "income",
      currency: "USD",
      date: new Date("2026-02-20T00:00:00.000Z"),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/transactions",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload).toMatchObject({
      title: "Salary payment",
      amount: "1500",
      note: "Monthly salary",
      category_id: "cat-2",
      category_name: "Salary",
      category_icon: "HiCurrencyDollar",
      category_icon_pack: "hi",
      category_color: "ocean",
      type: "income",
      currency: "usd",
      account_id: "acc-1",
    });
    expect(payload.date).toBe("2026-02-20T00:00:00.000Z");
    expect(showSuccessNotificationMock).toHaveBeenCalledWith(
      "Transaction added !",
    );
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("shows an error notification on failure", async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchResponse(false, { error: "boom" }),
    );
    renderToStaticMarkup(
      <CreateTransaction accountId="acc-1" categories={categories} />,
    );

    await submitHandler?.({
      title: "Coffee",
      amount: "10",
      category_id: "cat-1",
      type: "expense",
      currency: "JPY",
      date: new Date("2026-02-20T00:00:00.000Z"),
    });

    expect(showErrorNotificationMock).toHaveBeenCalledWith(
      "Failed to add transaction",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
