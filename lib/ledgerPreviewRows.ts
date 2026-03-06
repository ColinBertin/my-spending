import { Transaction } from "@/types";

export type LedgerPreviewRowKind =
  | "carry"
  | "entry"
  | "subtotal"
  | "closing"
  | "footer";

export type LedgerPreviewRow = {
  id: string;
  kind: LedgerPreviewRowKind;
  transactionId?: string;
  dateLabel?: string;
  accountLabel?: string;
  description?: string;
  income?: number;
  expense?: number;
  balance?: number;
  summary?: boolean;
};

export type LedgerPreviewOptions = {
  generalLedger?: boolean;
};

export type JournalLedgerEntry = {
  id: string;
  transactionId?: string;
  voucherNo: number;
  accountLabel: string;
  description: string;
  debit?: number;
  credit?: number;
};

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function fmtMD(value: Date | string) {
  const d = toDate(value);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function dayKey(value: Date | string) {
  const d = toDate(value);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function monthKey(value: Date | string) {
  const d = toDate(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabelJP(value: Date | string) {
  const d = toDate(value);
  const m = d.getMonth() + 1;
  const fw = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
  const toFW = (n: number) =>
    String(n)
      .split("")
      .map((ch) => fw[Number(ch)])
      .join("");

  return `${toFW(m)}月度　合計`;
}

export function buildLedgerPreviewRows(
  transactions: Transaction[],
  openingBalance = 0,
  options: LedgerPreviewOptions = {},
) {
  const rows: LedgerPreviewRow[] = [
    {
      id: "carry",
      kind: "carry",
      description: "前期より繰越",
      balance: openingBalance,
    },
  ];

  const txs = [...transactions].sort((a, b) => {
    const da = toDate(a.date).getTime();
    const db = toDate(b.date).getTime();
    if (da !== db) return da - db;
    return String(a.id).localeCompare(String(b.id));
  });

  let running = openingBalance;
  let monthIncome = 0;
  let monthExpense = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  let currentMonth: string | null = null;
  let previousDay: string | null = null;

  const pushSubtotalRow = (dateForMonth: Date | string) => {
    rows.push({
      id: `subtotal-${monthKey(dateForMonth)}`,
      kind: "subtotal",
      description: monthLabelJP(dateForMonth),
      income: monthIncome,
      expense: monthExpense,
      summary: true,
    });
  };

  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    const txMonth = monthKey(tx.date);
    const txDay = dayKey(tx.date);

    if (currentMonth && currentMonth !== txMonth) {
      pushSubtotalRow(txs[i - 1].date);
      monthIncome = 0;
      monthExpense = 0;
      previousDay = null;
    }

    currentMonth = txMonth;

    const amount = Number(tx.amount) || 0;
    const income = tx.type === "income" ? amount : 0;
    const expense = tx.type === "expense" ? amount : 0;
    const description = tx.note?.trim()
      ? `${tx.title} / ${tx.note.trim()}`
      : tx.title;

    monthIncome += income;
    monthExpense += expense;
    totalIncome += income;
    totalExpense += expense;
    running = running + income - expense;

    rows.push({
      id: `entry-${tx.id}`,
      kind: "entry",
      transactionId: tx.id,
      dateLabel: `${previousDay !== txDay ? fmtMD(tx.date) : ""}\n${i + 1}`,
      accountLabel: options.generalLedger
        ? tx.category_name || "未分類"
        : "現金",
      description,
      income: income || undefined,
      expense: expense || undefined,
      balance: running,
    });

    previousDay = txDay;
  }

  if (txs.length > 0) {
    pushSubtotalRow(txs[txs.length - 1].date);
  }

  if (options.generalLedger) {
    const periodNet = totalIncome - totalExpense;
    const closingIncome = periodNet < 0 ? Math.abs(periodNet) : 0;
    const closingExpense = periodNet > 0 ? periodNet : 0;

    if (txs.length > 0 && periodNet !== 0) {
      running = openingBalance;
      rows.push({
        id: "closing-entry",
        kind: "closing",
        dateLabel: `12/31\n${txs.length + 1}`,
        accountLabel: closingIncome > 0 ? "事業主借" : "事業主貸",
        income: closingIncome || undefined,
        expense: closingExpense || undefined,
        balance: running,
      });
    }

    rows.push({
      id: "footer-closing-total",
      kind: "footer",
      description: "決算仕訳　合計",
      income: closingIncome,
      expense: closingExpense,
      summary: true,
    });
    rows.push({
      id: "footer-period-total",
      kind: "footer",
      description: "当期累計",
      income: totalIncome + closingIncome,
      expense: totalExpense + closingExpense,
      summary: true,
    });
    rows.push({
      id: "footer-carry-forward",
      kind: "footer",
      description: "翌期へ繰越",
      balance: openingBalance,
      summary: true,
    });

    return rows;
  }

  rows.push({
    id: "footer-period-total",
    kind: "footer",
    description: "当期累計",
    income: totalIncome,
    expense: totalExpense,
    balance: openingBalance + (totalIncome - totalExpense),
    summary: true,
  });

  return rows;
}

export function buildJournalLedgerPreviewRows(
  entries: JournalLedgerEntry[],
  options: {
    openingBalance?: number;
    monthLabel?: string;
    balanceMode?: "debit_increases" | "credit_increases";
  } = {},
) {
  const openingBalance = options.openingBalance ?? 0;
  const monthLabel = options.monthLabel ?? "１２月度　合計";
  const balanceMode = options.balanceMode ?? "debit_increases";

  const rows: LedgerPreviewRow[] = [
    {
      id: "carry",
      kind: "carry",
      description: "前期より繰越",
      balance: openingBalance,
      summary: true,
    },
  ];

  let running = openingBalance;
  let totalDebit = 0;
  let totalCredit = 0;

  for (const entry of entries) {
    const debit = Number(entry.debit) || 0;
    const credit = Number(entry.credit) || 0;

    totalDebit += debit;
    totalCredit += credit;
    running +=
      balanceMode === "debit_increases" ? debit - credit : credit - debit;

    rows.push({
      id: entry.id,
      kind: "entry",
      transactionId: entry.transactionId,
      dateLabel: `12/31\n${entry.voucherNo}`,
      accountLabel: entry.accountLabel,
      description: entry.description,
      income: debit || undefined,
      expense: credit || undefined,
      balance: running,
    });
  }

  rows.push({
    id: "subtotal-december",
    kind: "subtotal",
    description: monthLabel,
    income: totalDebit,
    expense: totalCredit,
    summary: true,
  });
  rows.push({
    id: "footer-period-total",
    kind: "footer",
    description: "当期累計",
    income: totalDebit,
    expense: totalCredit,
    summary: true,
  });
  rows.push({
    id: "footer-carry-forward",
    kind: "footer",
    description: "翌期へ繰越",
    balance: running,
    summary: true,
  });

  return rows;
}
