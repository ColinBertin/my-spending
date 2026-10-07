import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildJournalLedgerPreviewRows,
  buildLedgerPreviewRows,
} from "@/lib/ledgerPreviewRows";
import { Category, Transaction } from "@/types";
import { getLedgerPreview, getProfessionalAccountName } from "./ledger-preview";

const getProfessionalLedgerContextMock = vi.fn();
const getTransactionsForRangeMock = vi.fn();
const maybeSingleMock = vi.fn();
const fromMock = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/utils/supabase/requireUser", () => ({
  requirePageUser: async () => ({
    user: { id: "user-1" },
    supabase: { from: fromMock },
  }),
}));

vi.mock("./data", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./data")>();
  return {
    ...actual,
    getProfessionalLedgerContext: () => getProfessionalLedgerContextMock(),
    getTransactionsForRange: (...args: unknown[]) =>
      getTransactionsForRangeMock(...args),
  };
});

const categories: Category[] = [
  { id: "c1", name: "売上高", type: "professional" },
  { id: "c2", name: "水道光熱費", type: "professional" },
  { id: "c3", name: "消耗品費", type: "professional" },
] as Category[];

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "t",
    title: "Entry",
    type: "expense",
    category_name: "消耗品費",
    amount: 100,
    currency: "JPY",
    date: new Date("2025-03-01T00:00:00.000Z"),
    ...overrides,
  };
}

const yearTransactions = [
  tx({
    id: "y1",
    title: "Consulting",
    type: "income",
    category_name: "売上高",
    amount: 5000,
    date: new Date("2025-01-05T00:00:00.000Z"),
  }),
  tx({
    id: "y2",
    title: "Electricity",
    category_name: "水道光熱費",
    amount: 120,
    date: new Date("2025-02-10T00:00:00.000Z"),
  }),
  tx({ id: "y3", title: "Paper", amount: 80 }),
];

const januaryTransactions = [
  tx({
    id: "j2",
    title: "December gas",
    category_name: "水道光熱費",
    amount: 90,
    date: new Date("2026-01-20T00:00:00.000Z"),
  }),
  tx({
    id: "j1",
    title: "December invoice",
    type: "income",
    category_name: "売上高",
    amount: 3000,
    date: new Date("2026-01-10T00:00:00.000Z"),
  }),
  tx({
    id: "j3",
    title: "Toner",
    amount: 40,
    date: new Date("2026-01-15T00:00:00.000Z"),
  }),
];

const yearEnd = new Date(Date.UTC(2025, 11, 31, 0, 0, 0));

describe("getLedgerPreview", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T00:00:00.000Z"));
    getProfessionalLedgerContextMock.mockResolvedValue({
      userId: "user-1",
      professionalAccountId: "acct-pro",
      categories,
    });
    getTransactionsForRangeMock.mockImplementation(
      async (
        _userId: string,
        _categories: Category[],
        _accountId: string,
        range: { startIso: string },
      ) =>
        range.startIso.startsWith("2026-01")
          ? januaryTransactions
          : yearTransactions,
    );
    maybeSingleMock.mockResolvedValue({
      data: { name: "Studio Pro" },
      error: null,
    });
    fromMock.mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: maybeSingleMock }) }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds the general ledger for the previous fiscal year", async () => {
    const preview = await getLedgerPreview("general-ledger");

    expect(preview.title).toBe("総勘定元帳 · General ledger");
    expect(preview.subtitle).toBe("STUDIO PRO · FY2025 · JPY");
    expect(preview.transactions).toEqual(yearTransactions);
    expect(preview.rows).toEqual(
      buildLedgerPreviewRows(yearTransactions, 0, { generalLedger: true }),
    );
    expect(preview.headerTitles).toBeUndefined();
    expect(preview.amountLabels).toEqual({
      income: "収入金額",
      expense: "支出金額",
    });
    expect(preview.totalIncome).toBe(5000);
    expect(preview.totalSpending).toBe(200);
    expect(preview.fileName).toBe("general_ledger_2025.pdf");
    expect(getTransactionsForRangeMock).toHaveBeenCalledTimes(1);
    expect(getTransactionsForRangeMock).toHaveBeenCalledWith(
      "user-1",
      categories,
      "acct-pro",
      expect.objectContaining({
        startIso: "2025-01-01T00:00:00.000Z",
        endIso: "2026-01-01T00:00:00.000Z",
      }),
    );
  });

  it("adds January entries dated 12/31 to adjustment-target category ledgers", async () => {
    const preview = await getLedgerPreview(encodeURIComponent("水道光熱費"));

    const expectedTransactions = [
      yearTransactions[1],
      { ...januaryTransactions[0], date: yearEnd },
    ];
    expect(preview.title).toBe("水道光熱費 · Category ledger");
    expect(preview.subtitle).toBe(
      "STUDIO PRO · FY2025 + JAN 2026 ADJUSTMENTS · JPY",
    );
    expect(preview.transactions).toEqual(expectedTransactions);
    expect(preview.rows).toEqual(
      buildLedgerPreviewRows(expectedTransactions, 0, {
        generalLedger: false,
      }),
    );
    expect(preview.fileName).toBe("水道光熱費_ledger_2025.pdf");
  });

  it("keeps other category ledgers to the fiscal year only", async () => {
    const preview = await getLedgerPreview("消耗品費");

    expect(preview.subtitle).toBe("STUDIO PRO · FY2025 · JPY");
    expect(preview.transactions).toEqual([yearTransactions[2]]);
    expect(getTransactionsForRangeMock).toHaveBeenCalledTimes(1);
  });

  it("builds the 売掛金 journal from January income", async () => {
    const preview = await getLedgerPreview("売掛金");

    expect(preview.title).toBe("売掛金 · January adjustment");
    expect(preview.subtitle).toBe("STUDIO PRO · JAN 2026 · JPY");
    expect(preview.transactions).toEqual([januaryTransactions[1]]);
    expect(preview.rows).toEqual(
      buildJournalLedgerPreviewRows(
        [
          {
            id: "entry-j1",
            transactionId: "j1",
            voucherNo: 1,
            accountLabel: "売上高",
            description: "December invoice",
            debit: 3000,
          },
        ],
        { balanceMode: "debit_increases" },
      ),
    );
    expect(preview.amountLabels).toEqual({
      income: "借方金額",
      expense: "貸方金額",
    });
    expect(preview.headerTitles?.[3]).toContain("借　方　金　額");
    expect(preview.fileName).toBe("売掛金_ledger_2026.pdf");
  });

  it("builds the 未払費用 journal from accrued January expenses", async () => {
    const preview = await getLedgerPreview("未払費用");

    expect(preview.transactions).toEqual([januaryTransactions[0]]);
    expect(preview.rows).toEqual(
      buildJournalLedgerPreviewRows(
        [
          {
            id: "entry-j2",
            transactionId: "j2",
            voucherNo: 1,
            accountLabel: "水道光熱費",
            description: "December gas",
            credit: 90,
          },
        ],
        { balanceMode: "credit_increases" },
      ),
    );
    expect(preview.totalSpending).toBe(90);
  });

  it("404s for ledgers that are not one of the user's categories", async () => {
    await expect(getLedgerPreview("someone-elses-category")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("falls back to a generic account label without a professional account", async () => {
    getProfessionalLedgerContextMock.mockResolvedValue({
      userId: "user-1",
      professionalAccountId: null,
      categories,
    });

    const preview = await getLedgerPreview("general-ledger");

    expect(preview.subtitle).toBe("PROFESSIONAL ACCOUNT · FY2025 · JPY");
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe("getProfessionalAccountName", () => {
  it("returns null without querying when there is no account", async () => {
    await expect(getProfessionalAccountName(null)).resolves.toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("throws query errors", async () => {
    const error = new Error("boom");
    fromMock.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error }),
        }),
      }),
    });

    await expect(getProfessionalAccountName("acct-pro")).rejects.toBe(error);
  });
});
