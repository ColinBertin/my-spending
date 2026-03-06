"use client";

import { ClipboardPen, Trash2 } from "lucide-react";
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
  formatNumber,
  isCarryOverRow,
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

      <Modal
        open={!!activeDialog}
        onClose={closeDialog}
        className="print-hidden"
      >
        {activeDialog?.mode === "update" && activeTransaction && editValues && (
          <div className="space-y-5">
            <ModalTitleText className="text-blue-dark">
              Update Transaction
            </ModalTitleText>
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
            <ModalTitleText className="text-red">
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
