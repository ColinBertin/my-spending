"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ClipboardPen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Button from "./Button";
import { Category, Transaction, TransactionType } from "../types";
import {
  useErrorNotification,
  useSuccessNotification,
} from "./ui/NotificationProvider";
import { LedgerPreviewRow } from "../lib/ledgerPreviewRows";

const HEADER_TITLES = [
  "日          付\n伝票No\n生成元",
  "相手勘定科目\n相手補助科目",
  "摘　　要",
  "補　助　科　目\n\n収　入　金　額",
  "支　出　金　額",
  "残　　高",
];

type EditFormState = {
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

const formatNumber = (value?: number) =>
  typeof value === "number" ? new Intl.NumberFormat("ja-JP").format(value) : "";

const formFieldClassName =
  "w-full h-10 border border-gray-500 rounded-xl px-3 text-gray-700 font-medium outline-none focus:border-purple-300";
const FIRST_PRINT_PAGE_CAPACITY = 38;
const FOLLOWING_PRINT_PAGE_CAPACITY = 36;

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function toInputDate(value: Date | string) {
  const date = toDate(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toIsoDateStart(value: string) {
  return `${value}T00:00:00.000Z`;
}

function buildInitialEditState(transaction: Transaction): EditFormState {
  return {
    title: transaction.title,
    type: transaction.type,
    categoryId: transaction.category_id ?? "",
    amount: String(transaction.amount),
    date: toInputDate(transaction.date),
    currency: (transaction.currency || "JPY").toUpperCase() as
      | "JPY"
      | "EUR"
      | "USD",
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
      <span className="font-medium text-gray-500">{label}</span>
      <span className="text-gray-800 break-all">{value}</span>
    </div>
  );
}

function countVisualLines(value: string | undefined, charsPerLine: number) {
  if (!value) return 1;

  return value.split("\n").reduce((total, line) => {
    const normalizedLength = line.trim().length;
    return total + Math.max(1, Math.ceil(normalizedLength / charsPerLine));
  }, 0);
}

function estimatePrintRowUnits(row: LedgerPreviewRow) {
  if (row.kind === "subtotal" || row.kind === "footer") {
    return 1;
  }

  const dateLines = countVisualLines(row.dateLabel, 8);
  const accountLines = countVisualLines(row.accountLabel, 12);
  const descriptionLines = countVisualLines(row.description, 34);
  const maxLines = Math.max(1, dateLines, accountLines, descriptionLines);

  if (maxLines <= 2) return 1;
  if (maxLines <= 4) return 2;
  return 3;
}

function buildPrintPages(rows: LedgerPreviewRow[]) {
  const previewRows = rows.filter((row) => row.kind !== "carry");
  const pages: LedgerPreviewRow[][] = [];
  let currentPage: LedgerPreviewRow[] = [];
  let remainingCapacity = FIRST_PRINT_PAGE_CAPACITY;

  for (const row of previewRows) {
    const rowUnits = estimatePrintRowUnits(row);

    if (currentPage.length > 0 && rowUnits > remainingCapacity) {
      pages.push(currentPage);
      currentPage = [];
      remainingCapacity = FOLLOWING_PRINT_PAGE_CAPACITY;
    }

    currentPage.push(row);
    remainingCapacity -= rowUnits;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

function InlineSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
      aria-hidden="true"
    />
  );
}

export default function LedgerPreviewTable({
  rows,
  transactions,
  categories,
  generalLedger,
  headerTitles = HEADER_TITLES,
}: {
  rows: LedgerPreviewRow[];
  transactions: Transaction[];
  categories: Category[];
  generalLedger: boolean;
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
    if (isSaving) return;
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
    if (!activeDialog || activeDialog.mode !== "update" || !editValues) return;

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
    if (!activeDialog || activeDialog.mode !== "delete") return;

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
  const canConfirmDelete =
    !!activeTransaction && confirmTitle.trim() === activeTransaction.title;
  const screenRows = useMemo(
    () => rows.filter((row) => row.kind !== "carry"),
    [rows],
  );
  const printPages = useMemo(() => buildPrintPages(rows), [rows]);

  return (
    <>
      <div className="print-only space-y-4">
        {printPages.map((pageRows, pageIndex) => (
          <div
            key={`print-page-${pageIndex + 1}`}
            className="ledger-print-page border border-blue-dark/20 bg-white"
          >
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
                      key={`print-${pageIndex + 1}-${title}`}
                      className="border border-black px-2 py-2 text-center font-semibold whitespace-pre-line"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
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
        ))}
      </div>

      <div className="ledger-preview-table-wrap print-hidden min-w-0 max-w-full overflow-x-auto border border-blue-dark/20 bg-white shadow-sm">
        <table className="ledger-preview-table w-full table-fixed border-collapse text-xs sm:text-sm">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[14%]" />
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="print-hidden w-[10%]" />
          </colgroup>
          <thead>
            <tr className="bg-gray-100">
              {headerTitles.map((title) => (
                <th
                  key={title}
                  className="border border-black px-2 py-2 text-center font-semibold whitespace-pre-line"
                >
                  {title}
                </th>
              ))}
              <th className="print-hidden border border-black px-2 py-2 text-center font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {screenRows.map((row) => {
              const transaction = row.transactionId
                ? transactionsById.get(row.transactionId)
                : undefined;

              return (
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
                  <td className="print-hidden border border-black px-2 py-1 align-top">
                    {transaction ? (
                      <div className="print-hidden flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openUpdateDialog(transaction)}
                          aria-label={`Update ${transaction.title}`}
                          title={`Update ${transaction.title}`}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center text-blue-dark transition-opacity hover:opacity-70"
                        >
                          <ClipboardPen className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(transaction)}
                          aria-label={`Delete ${transaction.title}`}
                          title={`Delete ${transaction.title}`}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center text-red-500 transition-opacity hover:opacity-70"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!activeDialog}
        onClose={closeDialog}
        className="print-hidden relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-xl rounded-2xl border border-blue-dark/20 bg-white p-5 shadow-xl">
            {activeDialog?.mode === "update" &&
              activeTransaction &&
              editValues && (
                <div className="space-y-5">
                  <DialogTitle className="text-xl font-semibold text-blue-dark">
                    Update Transaction
                  </DialogTitle>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-gray-600">Title</span>
                      <input
                        type="text"
                        value={editValues.title}
                        onChange={(event) =>
                          setEditValues((current) =>
                            current
                              ? { ...current, title: event.target.value }
                              : current,
                          )
                        }
                        className={formFieldClassName}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-gray-600">Type</span>
                      <select
                        value={editValues.type}
                        onChange={(event) =>
                          setEditValues((current) =>
                            current
                              ? {
                                  ...current,
                                  type: event.target.value as TransactionType,
                                }
                              : current,
                          )
                        }
                        className={formFieldClassName}
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-gray-600">
                        Category
                      </span>
                      <select
                        value={editValues.categoryId}
                        onChange={(event) =>
                          setEditValues((current) =>
                            current
                              ? { ...current, categoryId: event.target.value }
                              : current,
                          )
                        }
                        className={formFieldClassName}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-gray-600">Amount</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editValues.amount}
                        onChange={(event) =>
                          setEditValues((current) =>
                            current
                              ? { ...current, amount: event.target.value }
                              : current,
                          )
                        }
                        className={formFieldClassName}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-gray-600">
                        Currency
                      </span>
                      <select
                        value={editValues.currency}
                        onChange={(event) =>
                          setEditValues((current) =>
                            current
                              ? {
                                  ...current,
                                  currency: event.target.value as
                                    | "JPY"
                                    | "EUR"
                                    | "USD",
                                }
                              : current,
                          )
                        }
                        className={formFieldClassName}
                      >
                        <option value="JPY">JPY</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                      <span className="font-medium text-gray-600">Date</span>
                      <input
                        type="date"
                        value={editValues.date}
                        onChange={(event) =>
                          setEditValues((current) =>
                            current
                              ? { ...current, date: event.target.value }
                              : current,
                          )
                        }
                        className={formFieldClassName}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      text="Cancel"
                      color="neutral"
                      handleChange={closeDialog}
                      disabled={isSaving}
                      className="disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <Button
                      type="button"
                      text={
                        isSaving ? (
                          <span className="inline-flex items-center gap-2">
                            <InlineSpinner />
                            Saving...
                          </span>
                        ) : (
                          "Save Changes"
                        )
                      }
                      color="primary"
                      handleChange={handleUpdate}
                      disabled={isSaving}
                      className="disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>
              )}

            {activeDialog?.mode === "delete" && activeTransaction && (
              <div className="space-y-5">
                <DialogTitle className="text-xl font-semibold text-red">
                  Delete Transaction
                </DialogTitle>

                <div className="space-y-3 border border-gray-200 bg-gray-50 p-4">
                  <DetailRow label="Title" value={activeTransaction.title} />
                  <DetailRow
                    label="Type"
                    value={
                      activeTransaction.type === "income" ? "Income" : "Expense"
                    }
                  />
                  <DetailRow
                    label="Category"
                    value={activeTransaction.category_name || "未分類"}
                  />
                  <DetailRow
                    label="Amount"
                    value={String(activeTransaction.amount)}
                  />
                  <DetailRow
                    label="Currency"
                    value={String(activeTransaction.currency).toUpperCase()}
                  />
                  <DetailRow
                    label="Date"
                    value={toInputDate(activeTransaction.date)}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Type{" "}
                    <span className="font-semibold">
                      {activeTransaction.title}
                    </span>{" "}
                    to confirm deletion.
                  </p>
                  <input
                    type="text"
                    value={confirmTitle}
                    onChange={(event) => setConfirmTitle(event.target.value)}
                    className={formFieldClassName}
                    placeholder={activeTransaction.title}
                  />
                </div>

                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    text="Cancel"
                    color="neutral"
                    handleChange={closeDialog}
                    disabled={isSaving}
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <Button
                    type="button"
                    text={
                      isSaving ? (
                        <span className="inline-flex items-center gap-2">
                          <InlineSpinner />
                          Deleting...
                        </span>
                      ) : (
                        "Delete"
                      )
                    }
                    handleChange={handleDelete}
                    disabled={isSaving || !canConfirmDelete}
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
