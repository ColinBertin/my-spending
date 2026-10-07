"use client";

import { cn } from "@/lib/utils";
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Modal, { ModalTitleText } from "./Modal";
import { Category, Transaction, TransactionType } from "../types";
import {
  useErrorNotification,
  useSuccessNotification,
} from "./ui/NotificationProvider";
import { LedgerPreviewRow } from "../lib/ledgerPreviewRows";
import ModalDetailsContent from "./ModalDetailsContent";
import ModalInputForm from "./ModalInputForm";
import {
  buildInitialEditState,
  formatCurrencyIntoYen,
  formatNumber,
  isCarryOverRow,
  splitLedgerDateLabel,
  toInputDate,
  toIsoDateStart,
} from "@/helpers";

const HEADER_TITLES = [
  "日          付\n伝票No\n生成元",
  "相手勘定科目\n相手補助科目",
  "摘　　要",
  "補　助　科　目\n\n収　入　金　額",
  "支　出　金　額",
  "残　　高",
];

const headerCellClassName =
  "sticky top-0 z-10 border-r border-b border-r-[#E3DFD7] border-b-[#D9D4C9] bg-[#F4F1EA] px-3 py-[11px] align-bottom text-[10px] leading-[1.5] font-medium tracking-[0.08em] whitespace-pre-line text-[#6B6760]";
const bodyCellClassName =
  "border-r border-b border-[#F1EEE8] px-3 py-[9px] align-top text-[11px] text-[#3B3934]";
const amountCellClassName = "text-right text-[11.5px] font-medium";

function RowActions({
  transaction,
  onUpdate,
  onDelete,
}: {
  transaction: Transaction;
  onUpdate: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  return (
    <span className="flex flex-none justify-center gap-[7px]">
      <button
        type="button"
        onClick={() => onUpdate(transaction)}
        aria-label={`Update ${transaction.title}`}
        title={`Update ${transaction.title}`}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-[#E3DFD7] bg-white text-[#6B6760] transition-colors hover:bg-[#FBFAF7] hover:text-[#17161A]"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(transaction)}
        aria-label={`Delete ${transaction.title}`}
        title={`Delete ${transaction.title}`}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-[#F3CFC3] bg-white text-[#B0442A] transition-colors hover:bg-[#FCEDE8]"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export type EditFormState = {
  title: string;
  type: TransactionType;
  categoryId: string;
  amount: string;
  date: string;
  currency: "JPY" | "EUR" | "USD";
};

type ActiveDialog =
  | { mode: "update"; transaction: Transaction }
  | { mode: "delete"; transaction: Transaction }
  | null;

export default function LedgerPreviewTable({
  rows,
  transactions,
  categories,
  headerTitles = HEADER_TITLES,
}: {
  rows: LedgerPreviewRow[];
  transactions: Transaction[];
  categories: Category[];
  headerTitles?: string[];
}) {
  const router = useRouter();
  const showSuccessNotification = useSuccessNotification();
  const showErrorNotification = useErrorNotification();
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [editValues, setEditValues] = useState<EditFormState | null>(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const transactionsById = useMemo(
    () =>
      new Map(transactions.map((transaction) => [transaction.id, transaction])),
    [transactions],
  );

  const closeDialog = () => {
    if (isSaving) {
      return;
    }
    setActiveDialog(null);
    setEditValues(null);
    setConfirmTitle("");
  };

  const openUpdateDialog = (transaction: Transaction) => {
    setActiveDialog({ mode: "update", transaction });
    setEditValues(buildInitialEditState(transaction));
    setConfirmTitle("");
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setActiveDialog({ mode: "delete", transaction });
    setEditValues(null);
    setConfirmTitle("");
  };

  const handleUpdate = async () => {
    if (!activeDialog || activeDialog.mode !== "update" || !editValues) {
      return;
    }

    if (!editValues.title.trim()) {
      showErrorNotification("Title is required");
      return;
    }

    if (!editValues.categoryId) {
      showErrorNotification("Category is required");
      return;
    }

    const numericAmount = Number(editValues.amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showErrorNotification("Amount must be greater than 0");
      return;
    }

    if (!editValues.date) {
      showErrorNotification("Date is required");
      return;
    }

    setIsSaving(true);
    const res = await fetch(
      `/api/transactions/${activeDialog.transaction.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editValues.title.trim(),
          type: editValues.type,
          category_id: editValues.categoryId,
          amount: numericAmount,
          date: toIsoDateStart(editValues.date),
          currency: editValues.currency,
        }),
      },
    );
    const json = await res.json().catch(() => ({}));
    setIsSaving(false);

    if (!res.ok) {
      showErrorNotification(
        typeof json.error === "string"
          ? json.error
          : "Failed to update transaction",
      );
      return;
    }

    showSuccessNotification("Transaction updated");
    closeDialog();
    router.refresh();
  };

  const handleDelete = async () => {
    if (!activeDialog || activeDialog.mode !== "delete") {
      return;
    }

    setIsSaving(true);
    const res = await fetch(
      `/api/transactions/${activeDialog.transaction.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmTitle: confirmTitle.trim(),
        }),
      },
    );
    const json = await res.json().catch(() => ({}));
    setIsSaving(false);

    if (!res.ok) {
      showErrorNotification(
        typeof json.error === "string"
          ? json.error
          : "Failed to delete transaction",
      );
      return;
    }

    showSuccessNotification("Transaction deleted");
    closeDialog();
    router.refresh();
  };

  const activeTransaction = activeDialog?.transaction ?? null;
  const screenRows = useMemo(
    () => rows.filter((row) => !isCarryOverRow(row)),
    [rows],
  );

  const deleteRows = activeTransaction
    ? [
        {
          label: "Title",
          value: activeTransaction.title,
        },
        {
          label: "Type",
          value: activeTransaction.type === "income" ? "Income" : "Expense",
        },
        {
          label: "Category",
          value: activeTransaction.category_name || "未分類",
        },
        {
          label: "Amount",
          value: String(activeTransaction.amount),
        },
        {
          label: "Currency",
          value: String(activeTransaction.currency).toUpperCase(),
        },
        {
          label: "Date",
          value: toInputDate(activeTransaction.date),
        },
      ]
    : [];

  return (
    <>
      <div className="print-only border border-blue-dark/20 bg-white">
        <table className="ledger-preview-table w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[16%]" />
            <col className="w-[26%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="bg-gray-100">
              {headerTitles.map((title) => (
                <th
                  key={`print-${title}`}
                  className="border border-black px-2 py-2 text-center font-semibold whitespace-pre-line"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {screenRows.map((row) => (
              <tr
                key={row.id}
                className={row.summary ? "bg-[#bfbfbf]" : "bg-white"}
              >
                <td className="border border-black px-2 py-1 align-top whitespace-pre-line break-words">
                  {row.dateLabel ?? ""}
                </td>
                <td className="border border-black px-2 py-1 align-top break-words">
                  {row.accountLabel ?? ""}
                </td>
                <td className="border border-black px-2 py-1 align-top break-words">
                  {row.description ?? ""}
                </td>
                <td className="border border-black px-2 py-1 text-right align-top">
                  {formatNumber(row.income)}
                </td>
                <td className="border border-black px-2 py-1 text-right align-top">
                  {formatNumber(row.expense)}
                </td>
                <td className="border border-black px-2 py-1 text-right align-top">
                  {formatNumber(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ledger-preview-table-wrap print-hidden min-w-0">
        <div className="hidden overflow-hidden rounded-[12px] border border-[#D9D4C9] bg-white md:block">
          <div className="relative max-h-[640px] overflow-auto overscroll-contain">
            <table className="ledger-preview-table w-full min-w-[720px] border-separate border-spacing-0 font-mono tabular-nums">
              <colgroup>
                <col className="w-[86px]" />
                <col className="w-[150px]" />
                <col />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[84px]" />
              </colgroup>
              <thead>
                <tr>
                  {headerTitles.map((title, index) => (
                    <th
                      key={title}
                      className={cn(
                        headerCellClassName,
                        index >= 3 ? "text-right" : "text-left",
                      )}
                    >
                      {title}
                    </th>
                  ))}
                  <th
                    className={cn(
                      headerCellClassName,
                      "border-r-0 text-center",
                    )}
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {screenRows.map((row) => {
                  const transaction = row.transactionId
                    ? transactionsById.get(row.transactionId)
                    : undefined;
                  const { date, voucherNo } = splitLedgerDateLabel(
                    row.dateLabel,
                  );
                  const cellClassName = cn(
                    bodyCellClassName,
                    row.summary ? "bg-[#F4F1EA] font-medium" : "bg-white",
                  );

                  return (
                    <tr key={row.id}>
                      <td className={cellClassName}>
                        <div className="text-[11px]">{date}</div>
                        {voucherNo && (
                          <div className="mt-[3px] text-[10px] text-[#5C5952]">
                            {voucherNo}
                          </div>
                        )}
                      </td>
                      <td className={cn(cellClassName, "break-words")}>
                        {row.accountLabel ?? ""}
                      </td>
                      <td
                        className={cn(
                          cellClassName,
                          "font-sans text-[12px] leading-[1.45] break-words",
                        )}
                      >
                        {row.description ?? ""}
                      </td>
                      <td
                        className={cn(
                          cellClassName,
                          amountCellClassName,
                          "text-[#0E7C66]",
                        )}
                      >
                        {formatNumber(row.income)}
                      </td>
                      <td
                        className={cn(
                          cellClassName,
                          amountCellClassName,
                          "text-[#B0442A]",
                        )}
                      >
                        {formatNumber(row.expense)}
                      </td>
                      <td
                        className={cn(
                          cellClassName,
                          amountCellClassName,
                          "text-[#17161A]",
                        )}
                      >
                        {formatNumber(row.balance)}
                      </td>
                      <td className={cn(cellClassName, "border-r-0")}>
                        {transaction && (
                          <RowActions
                            transaction={transaction}
                            onUpdate={openUpdateDialog}
                            onDelete={openDeleteDialog}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:hidden">
          {screenRows.map((row) => {
            const transaction = row.transactionId
              ? transactionsById.get(row.transactionId)
              : undefined;
            const { date, voucherNo } = splitLedgerDateLabel(row.dateLabel);
            const hasAmount =
              row.income !== undefined || row.expense !== undefined;

            return (
              <div
                key={row.id}
                className={cn(
                  "rounded-[11px] border border-[#E3DFD7] px-[14px] py-[13px]",
                  row.summary ? "bg-[#F4F1EA]" : "bg-white",
                )}
              >
                {(voucherNo || row.accountLabel) && (
                  <div className="flex justify-between gap-[10px] font-mono text-[11px] leading-none text-[#5C5952]">
                    <span>
                      {[date, voucherNo && `No.${voucherNo}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <span className="truncate">{row.accountLabel ?? ""}</span>
                  </div>
                )}
                <div
                  className={cn(
                    "flex items-start justify-between gap-3",
                    (voucherNo || row.accountLabel) && "mt-2",
                  )}
                >
                  <p className="min-w-0 text-[13px] leading-[1.4] font-medium break-words">
                    {row.description ?? ""}
                  </p>
                  {transaction && (
                    <RowActions
                      transaction={transaction}
                      onUpdate={openUpdateDialog}
                      onDelete={openDeleteDialog}
                    />
                  )}
                </div>
                <div className="mt-[10px] flex flex-wrap justify-between gap-[10px] font-mono text-[13px] leading-none font-medium tabular-nums">
                  <span className="flex flex-wrap gap-[10px]">
                    {row.income !== undefined && (
                      <span className="text-[#0E7C66]">
                        +{formatCurrencyIntoYen(row.income)}
                      </span>
                    )}
                    {row.expense !== undefined && (
                      <span className="text-[#B0442A]">
                        −{formatCurrencyIntoYen(row.expense)}
                      </span>
                    )}
                    {!hasAmount && <span className="text-[#5C5952]">—</span>}
                  </span>
                  {row.balance !== undefined && (
                    <span className="text-[#5C5952]">
                      残 {formatCurrencyIntoYen(row.balance)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={!!activeDialog}
        onClose={closeDialog}
        className="print-hidden"
      >
        {activeDialog?.mode === "update" && activeTransaction && editValues && (
          <div className="space-y-5">
            <ModalTitleText>Update Transaction</ModalTitleText>
            <ModalInputForm
              values={editValues}
              setValues={setEditValues}
              categories={categories}
              isSaving={isSaving}
              closeDialog={closeDialog}
              handleSave={handleUpdate}
            />
          </div>
        )}

        {activeDialog?.mode === "delete" && activeTransaction && (
          <div className="space-y-5">
            <ModalTitleText className="text-[#9E3B21]">
              Delete Transaction
            </ModalTitleText>
            <ModalDetailsContent
              rows={deleteRows}
              confirmValue={confirmTitle}
              setConfirmValue={setConfirmTitle}
              confirmTarget={activeTransaction.title}
              closeDialog={closeDialog}
              isSaving={isSaving}
              handleDelete={handleDelete}
            />
          </div>
        )}
      </Modal>
    </>
  );
}
