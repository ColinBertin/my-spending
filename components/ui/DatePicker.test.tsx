// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DatePicker from "./DatePicker";

function getInput() {
  return screen.getByLabelText("Date") as HTMLInputElement;
}

describe("DatePicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a labelled native date input in the Input style", () => {
    render(<DatePicker id="transaction-date" title="Date" />);

    const input = getInput();
    expect(input.type).toBe("date");
    expect(input.dataset.slot).toBe("input");
    expect(input.className).toContain("font-mono");
    expect(input.className).toContain("rounded-control");
  });

  it("shows a Date value as YYYY-MM-DD", () => {
    render(
      <DatePicker
        id="d"
        title="Date"
        value={new Date(2026, 1, 20, 12)}
        onChange={vi.fn()}
      />,
    );

    expect(getInput().value).toBe("2026-02-20");
  });

  it("accepts an ISO string value", () => {
    const iso = new Date(2026, 1, 20, 12).toISOString();
    render(<DatePicker id="d" title="Date" value={iso} onChange={vi.fn()} />);

    expect(getInput().value).toBe("2026-02-20");
  });

  it("is empty when there is no value", () => {
    render(<DatePicker id="d" title="Date" value={null} onChange={vi.fn()} />);

    expect(getInput().value).toBe("");
  });

  it("calls onChange with a Date at local noon of the picked day", () => {
    const onChange = vi.fn();
    render(<DatePicker id="d" title="Date" onChange={onChange} />);

    fireEvent.change(getInput(), { target: { value: "2026-03-07" } });

    const picked = onChange.mock.calls[0][0] as Date;
    expect(picked).toBeInstanceOf(Date);
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual(
      [2026, 2, 7],
    );
    expect(picked.getHours()).toBe(12);
  });

  it("calls onChange with undefined when the date is cleared", () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        id="d"
        title="Date"
        value={new Date(2026, 2, 7, 12)}
        onChange={onChange}
      />,
    );

    fireEvent.change(getInput(), { target: { value: "" } });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("converts min and max Dates to the picker's format", () => {
    render(
      <DatePicker
        id="d"
        title="Date"
        min={new Date(2026, 0, 1, 12)}
        max={new Date(2026, 10, 26, 12)}
      />,
    );

    expect(getInput().min).toBe("2026-01-01");
    expect(getInput().max).toBe("2026-11-26");
  });

  it("shows the error and marks the input invalid", () => {
    render(
      <DatePicker
        id="d"
        title="Date"
        aria-invalid
        errorMessage="The date can't be in the future"
      />,
    );

    expect(getInput().getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toContain(
      "The date can't be in the future",
    );
  });

  it("merges extra classes with font-mono", () => {
    render(<DatePicker id="d" title="Date" className="h-9" />);

    expect(getInput().className).toContain("font-mono");
    expect(getInput().className).toContain("h-9");
    expect(getInput().className).not.toContain("h-11");
  });
});
