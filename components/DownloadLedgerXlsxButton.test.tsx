import { describe, expect, it, vi } from "vitest";
import type { Transaction } from "../types";
import { DownloadLedgerXlsxButton } from "./DownloadLedgerXlsxButton";

const buildLedgerWorkbookMock = vi.fn();
const writeFileMock = vi.fn();

vi.mock("../lib/ledgerXlsx", () => ({
  buildLedgerWorkbook: (...args: unknown[]) => buildLedgerWorkbookMock(...args),
}));

vi.mock("xlsx", () => ({
  writeFile: (...args: unknown[]) => writeFileMock(...args),
}));

describe("DownloadLedgerXlsxButton", () => {
  it("builds workbook and writes normalized .xlsx filename", async () => {
    const transactions: Transaction[] = [
      {
        id: "tx-1",
        title: "Salary",
        type: "income",
        category_name: "Income",
        amount: 1000,
        currency: "JPY",
        date: new Date("2025-01-01T00:00:00.000Z"),
      },
    ];
    const fakeWorkbook = { SheetNames: ["Feuil1"], Sheets: {} };
    buildLedgerWorkbookMock.mockResolvedValue(fakeWorkbook);

    const element = DownloadLedgerXlsxButton({
      transactions,
      fileName: "general-ledger",
      generalLedger: true,
    });

    await element.props.onClick();

    expect(buildLedgerWorkbookMock).toHaveBeenCalledWith(transactions, 0, {
      generalLedger: true,
    });
    expect(writeFileMock).toHaveBeenCalledWith(
      fakeWorkbook,
      "general-ledger.xlsx",
    );
  });

  it("does nothing when button is disabled", async () => {
    const element = DownloadLedgerXlsxButton({
      transactions: [],
      fileName: "ledger.xlsx",
      disabled: true,
    });

    await element.props.onClick();

    expect(buildLedgerWorkbookMock).not.toHaveBeenCalled();
    expect(writeFileMock).not.toHaveBeenCalled();
  });
});
