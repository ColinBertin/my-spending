import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Signup from "./signup";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [false, (cb: () => void) => cb()] as const,
  };
});

vi.mock("@/public/brand/app-icon-dark.svg", () => ({
  default: { src: "/brand/app-icon-dark.svg", width: 64, height: 64 },
}));

const pushMock = vi.fn();
const showSuccessNotificationMock = vi.fn();
const showErrorNotificationMock = vi.fn();
const signUpWithPasswordMock = vi.fn();

type Rules = {
  required?: string;
  validate?: (value: string, formValues: Record<string, string>) => unknown;
};

let submitHandler: ((values: Record<string, string>) => Promise<void>) | null =
  null;
const registeredRules: Record<string, Rules | undefined> = {};
let formErrors: Record<string, { message: string }> = {};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/components/ui/NotificationProvider", () => ({
  useSuccessNotification: () => showSuccessNotificationMock,
  useErrorNotification: () => showErrorNotificationMock,
}));

vi.mock("@/utils/authClient", () => ({
  signUpWithPassword: (...args: unknown[]) => signUpWithPasswordMock(...args),
}));

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: (name: string, rules?: Rules) => {
      registeredRules[name] = rules;
      return { name };
    },
    handleSubmit: (cb: (values: Record<string, string>) => Promise<void>) => {
      submitHandler = cb;
      return () => undefined;
    },
    formState: { errors: formErrors },
  }),
}));

const validValues = {
  username: "testuser",
  email: "user@example.com",
  password: "test-password",
  confirmPassword: "test-password",
};

describe("Signup", () => {
  beforeEach(() => {
    submitHandler = null;
    formErrors = {};
    for (const key of Object.keys(registeredRules)) {
      delete registeredRules[key];
    }
    signUpWithPasswordMock.mockResolvedValue({ error: null });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the signup copy, all fields and the log-in link", () => {
    const html = renderToStaticMarkup(<Signup />);

    expect(html).toContain("Create your account");
    expect(html).toContain("Create account");
    expect(html).toContain("Already have an account?");
    expect(html).toContain("Log in");
    for (const id of ["username", "email", "password", "confirmPassword"]) {
      expect(html).toContain(`for="${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
  });

  it("renders field error messages", () => {
    formErrors = {
      email: { message: "Invalid email format" },
      confirmPassword: { message: "Passwords do not match" },
    };
    const html = renderToStaticMarkup(<Signup />);

    expect(html).toContain("Invalid email format");
    expect(html).toContain("Passwords do not match");
  });

  it("registers the existing validation rules", () => {
    renderToStaticMarkup(<Signup />);

    expect(registeredRules.username?.required).toBe("Username is required");
    expect(registeredRules.email?.required).toBe("Email is required");
    expect(registeredRules.password?.required).toBe("Password is required");

    const validateEmail = registeredRules.email?.validate;
    expect(validateEmail?.("user@example.com", validValues)).toBe(true);
    expect(validateEmail?.("not-an-email", validValues)).toBe(
      "Invalid email format",
    );

    const validateConfirm = registeredRules.confirmPassword?.validate;
    expect(validateConfirm?.("test-password", validValues)).toBe(true);
    expect(validateConfirm?.("different", validValues)).toBe(
      "Passwords do not match",
    );
  });

  it("signs up and redirects home on success", async () => {
    renderToStaticMarkup(<Signup />);
    expect(submitHandler).not.toBeNull();

    await submitHandler?.(validValues);

    expect(signUpWithPasswordMock).toHaveBeenCalledWith(
      "user@example.com",
      "test-password",
      "testuser",
    );
    expect(pushMock).toHaveBeenCalledWith("/");
    expect(showSuccessNotificationMock).toHaveBeenCalledWith(
      "Signup successful !",
    );
    expect(showErrorNotificationMock).not.toHaveBeenCalled();
  });

  it("shows an error notification and stays on the page on failure", async () => {
    signUpWithPasswordMock.mockResolvedValueOnce({ error: "Email taken" });
    renderToStaticMarkup(<Signup />);

    await submitHandler?.(validValues);

    expect(showErrorNotificationMock).toHaveBeenCalledWith("Email taken");
    expect(pushMock).not.toHaveBeenCalled();
    expect(showSuccessNotificationMock).not.toHaveBeenCalled();
  });
});
