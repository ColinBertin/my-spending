import { renderToStaticMarkup } from "react-dom/server";
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
    setValue: vi.fn(),
    control: {},
    formState: { errors: {} },
  }),
  useWatch: () => "rose",
  Controller: ({
    render,
  }: {
    render: (params: {
      field: { value: string; onChange: (...event: unknown[]) => void };
    }) => React.ReactNode;
  }) =>
    render({
      field: {
        value: "rose",
        onChange: vi.fn(),
      },
    }),
}));

vi.mock("@/components/ColorPicker", () => ({
  default: () => <div>Mock ColorPicker</div>,
}));

vi.mock("@/components/FinanceIconPicker", () => ({
  FinanceIconPicker: () => <div>Mock FinanceIconPicker</div>,
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
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(makeFetchResponse(true, {}));
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    consoleErrorSpy.mockRestore();
  });

  it("renders expected static form text", () => {
    const html = renderToStaticMarkup(<CreateCategory />);

    expect(html).toContain("New Category");
    expect(html).toContain("Mock ColorPicker");
    expect(html).toContain("Mock FinanceIconPicker");
  });

  it("submits category and redirects on success", async () => {
    renderToStaticMarkup(<CreateCategory />);
    expect(submitHandler).not.toBeNull();

    await submitHandler?.({
      name: "Food",
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
      color: "rose",
      icon: "HiCoffee",
      icon_pack: "hi",
    });
    expect(showSuccessNotificationMock).toHaveBeenCalledWith(
      "Category created !",
    );
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("shows an error notification on failure", async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchResponse(false, { error: "boom" }),
    );
    renderToStaticMarkup(<CreateCategory />);

    await submitHandler?.({
      name: "Food",
      color: "rose",
      icon: "HiCoffee",
      icon_pack: "hi",
    });

    expect(showErrorNotificationMock).toHaveBeenCalledWith(
      "Failed to create account",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
