import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateAccount from "./create-account";

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

vi.mock("../../../../components/ui/NotificationProvider", () => ({
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
    formState: { errors: {} },
  }),
}));

function makeFetchResponse(ok: boolean, jsonValue: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(jsonValue),
  };
}

describe("CreateAccount", () => {
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
    const html = renderToStaticMarkup(<CreateAccount />);

    expect(html).toContain("New Account");
    expect(html).toContain("Name");
    expect(html).toContain("Cancel");
    expect(html).toContain("Add");
  });

  it("submits account and redirects on success", async () => {
    renderToStaticMarkup(<CreateAccount />);
    expect(submitHandler).not.toBeNull();

    await submitHandler?.({
      name: "Main Account",
      type: "shared",
      currency: "USD",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/accounts",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload).toEqual({
      name: "Main Account",
      type: "shared",
      currency: "USD",
    });
    expect(showSuccessNotificationMock).toHaveBeenCalledWith(
      "New Account created !",
    );
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("shows an error notification on failure", async () => {
    fetchMock.mockResolvedValueOnce(
      makeFetchResponse(false, { error: "boom" }),
    );
    renderToStaticMarkup(<CreateAccount />);

    await submitHandler?.({
      name: "Main Account",
      type: "single",
      currency: "JPY",
    });

    expect(showErrorNotificationMock).toHaveBeenCalledWith(
      "Failed to create account",
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
