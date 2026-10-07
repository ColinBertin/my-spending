import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ReportsPage, { metadata } from "./page";

const getLedgerPreviewMock = vi.fn();

vi.mock("../ledger/ledger-preview", () => ({
  GENERAL_LEDGER_NAME: "general-ledger",
  getLedgerPreview: (name: string) => getLedgerPreviewMock(name),
}));

vi.mock("@/components/LedgerPreview", () => ({
  default: (props: {
    title: string;
    backHref: string;
    backLabel: string;
    autoDownload?: boolean;
  }) => (
    <div>
      {props.title}|{props.backHref}|{props.backLabel}|
      {props.autoDownload ? "auto" : "manual"}
    </div>
  ),
}));

describe("ReportsPage", () => {
  it("renders the general ledger preview", async () => {
    getLedgerPreviewMock.mockResolvedValue({
      title: "総勘定元帳 · General ledger",
    });

    const html = renderToStaticMarkup(
      await ReportsPage({ searchParams: Promise.resolve({}) }),
    );

    expect(getLedgerPreviewMock).toHaveBeenCalledWith("general-ledger");
    expect(html).toContain(
      "総勘定元帳 · General ledger|/ledger|Ledger generator|",
    );
    expect(html).toContain("manual");
    expect(metadata.title).toBe("Reports");
  });

  it("starts the PDF print when ?download=1", async () => {
    getLedgerPreviewMock.mockResolvedValue({ title: "GL" });

    const html = renderToStaticMarkup(
      await ReportsPage({ searchParams: Promise.resolve({ download: "1" }) }),
    );

    expect(html).toContain("auto");
  });
});
