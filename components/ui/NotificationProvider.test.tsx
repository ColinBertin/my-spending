// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NotificationProvider, {
  useErrorNotification,
  useSuccessNotification,
} from "./NotificationProvider";

function Triggers() {
  const showSuccess = useSuccessNotification();
  const showError = useErrorNotification();
  return (
    <>
      <button onClick={() => showSuccess("Account created")}>success</button>
      <button onClick={() => showError("Failed to save")}>error</button>
    </>
  );
}

function renderWithProvider() {
  return render(
    <NotificationProvider>
      <Triggers />
    </NotificationProvider>,
  );
}

describe("NotificationProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows a success notification as a polite status", () => {
    renderWithProvider();

    fireEvent.click(screen.getByText("success"));

    const toast = screen.getByRole("status");
    expect(toast.textContent).toContain("Success");
    expect(toast.textContent).toContain("Account created");
  });

  it("shows an error notification as an alert", () => {
    renderWithProvider();

    fireEvent.click(screen.getByText("error"));

    const toast = screen.getByRole("alert");
    expect(toast.textContent).toContain("Error");
    expect(toast.textContent).toContain("Failed to save");
  });

  it("renders above modals", () => {
    renderWithProvider();

    fireEvent.click(screen.getByText("success"));

    const region = screen.getByRole("status").closest("[aria-live]");
    expect(region?.className).toContain("z-[60]");
  });

  it("hides when the close button is clicked", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("success"));

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("auto-dismisses after 8 seconds", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("success"));

    act(() => {
      vi.advanceTimersByTime(7_999);
    });
    expect(screen.queryByRole("status")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    // Let the leave transition finish.
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("restarts the timer when a new notification replaces the current one", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("success"));

    act(() => {
      vi.advanceTimersByTime(6_000);
    });
    fireEvent.click(screen.getByText("error"));
    act(() => {
      vi.advanceTimersByTime(6_000);
    });

    // 12s after the first toast, but only 6s after the second — still visible.
    expect(screen.getByRole("alert").textContent).toContain("Failed to save");
  });
});
