"use client";

import * as XLSX from "xlsx";
import { buildLedgerWorkbook } from "@/lib/ledgerXlsx";
import { Transaction } from "@/types";

type DownloadLedgerXlsxButtonProps = {
  transactions: Transaction[];
  fileName?: string;
  label?: string;
  disabled?: boolean;
  generalLedger?: boolean;
};

export function DownloadLedgerXlsxButton({
  transactions,
  fileName = "ledger.xlsx",
  label = "Generate Excel",
  disabled = false,
  generalLedger = false,
}: DownloadLedgerXlsxButtonProps) {
  const onClick = async () => {
    if (disabled) return;

    try {
      const wb = await buildLedgerWorkbook(transactions, 0, { generalLedger });
      const normalizedFileName = fileName.endsWith(".xlsx")
        ? fileName
        : `${fileName}.xlsx`;
      XLSX.writeFile(wb, normalizedFileName);
    } catch (error) {
      console.error("Failed to generate ledger workbook", error);
      window.alert("Failed to generate Excel file.");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`font-semibold py-2 px-4 rounded-3xl w-full transition-colors ${
        disabled
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-blue-dark hover:bg-blue-light text-white cursor-pointer"
      }`}
    >
      {label}
    </button>
  );
}
