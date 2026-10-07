"use client";

import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import StatTile from "@/components/StatTile";
import { formatCurrencyIntoYen } from "@/helpers";
import { Transaction } from "@/types";
import { MONTH_PARAM, parseMonthParam, toMonthParam } from "../../month-param";
import { TransactionRowsSkeleton } from "./details-skeleton";

type TypeFilter = "all" | "income" | "expense";

type LoadedMonth = {
  key: string;
  transactions: Transaction[];
  error?: string;
};

const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expense" },
];

const MIX_COLORS = [
  "#17161A",
  "#E8552F",
  "#0E7C66",
  "#4A6FA5",
  "#5C5952",
  "#C9C3B7",
];
const MIX_SLOTS = MIX_COLORS.length;

type MixSlice = {
  name: string;
  total: number;
  percentage: number;
  color: string;
};

export function buildCategoryMix(transactions: Transaction[]): MixSlice[] {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }
    const name = transaction.category_name || "Uncategorized";
    totals.set(name, (totals.get(name) ?? 0) + Number(transaction.amount));
  }

  const ranked = Array.from(totals, ([name, total]) => ({ name, total })).sort(
    (a, b) => b.total - a.total,
  );
  const grandTotal = ranked.reduce((sum, row) => sum + row.total, 0);
  if (grandTotal <= 0) {
    return [];
  }

  const visible =
    ranked.length > MIX_SLOTS
      ? [
          ...ranked.slice(0, MIX_SLOTS - 1),
          {
            name: "Other",
            total: ranked
              .slice(MIX_SLOTS - 1)
              .reduce((sum, row) => sum + row.total, 0),
          },
        ]
      : ranked;

  return visible.map((row, index) => ({
    ...row,
    percentage: (row.total / grandTotal) * 100,
    color: MIX_COLORS[index],
  }));
}

function toConicGradient(slices: MixSlice[]) {
  let at = 0;
  const stops = slices.map((slice) => {
    const end = at + slice.percentage;
    const stop = `${slice.color} ${at.toFixed(1)}% ${end.toFixed(1)}%`;
    at = end;
    return stop;
  });
  return `conic-gradient(${stops.join(",")})`;
}

function formatRowDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}

export default function AccountDetails({
  accountId,
  transactions,
  initialMonth,
  initialYear,
}: {
  accountId: string;
  transactions: Transaction[];
  initialMonth: string;
  initialYear: string;
}) {
  const searchParams = useSearchParams();
  const initial = { year: Number(initialYear), month: Number(initialMonth) };
  const initialKey = toMonthParam(initial);
  const requested = parseMonthParam(searchParams.get(MONTH_PARAM)) ?? initial;
  const requestedKey = toMonthParam(requested);

  const [loaded, setLoaded] = useState<LoadedMonth>({
    key: initialKey,
    transactions,
  });
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const isFetching = loaded.key !== requestedKey;

  useEffect(() => {
    if (loaded.key === requestedKey) {
      return;
    }

    const controller = new AbortController();
    const url = `/api/transactions?accountId=${encodeURIComponent(accountId)}&selectedMonth=${requested.month}&selectedYear=${requested.year}`;

    (async () => {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json.error ?? "Failed to get transactions");
        }

        setLoaded({ key: requestedKey, transactions: json.transactions ?? [] });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setLoaded({
          key: requestedKey,
          transactions: [],
          error:
            error instanceof Error
              ? error.message
              : "Failed to get transactions",
        });
      }
    })();

    return () => controller.abort();
  }, [accountId, loaded.key, requested.month, requested.year, requestedKey]);

  const monthTransactions = loaded.transactions;

  const { income, spending } = useMemo(
    () =>
      monthTransactions.reduce(
        (totals, transaction) => {
          const amount = Number(transaction.amount) || 0;
          if (transaction.type === "income") {
            totals.income += amount;
          } else {
            totals.spending += amount;
          }
          return totals;
        },
        { income: 0, spending: 0 },
      ),
    [monthTransactions],
  );

  const mix = useMemo(
    () => buildCategoryMix(monthTransactions),
    [monthTransactions],
  );

  const rows = useMemo(
    () =>
      monthTransactions
        .filter(
          (transaction) =>
            typeFilter === "all" || transaction.type === typeFilter,
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [monthTransactions, typeFilter],
  );

  const monthLabel = new Date(
    Date.UTC(requested.year, requested.month - 1, 1),
  ).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const retry = () => setLoaded((previous) => ({ ...previous, key: "" }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
      <section
        className={clsx(
          "rounded-[12px] border border-[#E3DFD7] bg-white px-[18px] py-5 transition-opacity",
          isFetching && "opacity-60",
        )}
      >
        <h2 className="mb-[18px] text-[14px] leading-none font-semibold">
          Category mix
        </h2>
        <div className="flex justify-center pt-[6px] pb-[14px]">
          <div
            className="relative h-[180px] w-[180px] rounded-full sm:h-[200px] sm:w-[200px]"
            style={{
              background: mix.length > 0 ? toConicGradient(mix) : "#F1EEE8",
            }}
          >
            <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-white">
              <div className="font-mono text-[9px] leading-none font-medium tracking-[0.12em] text-[#5C5952]">
                SPENT
              </div>
              <div className="mt-[5px] font-mono text-[20px] leading-[1.1] font-semibold tabular-nums">
                {formatCurrencyIntoYen(spending)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[9px] border-t border-[#E3DFD7] pt-[14px]">
          {mix.length === 0 ? (
            <p className="py-2 text-center text-[12px] text-[#6B6760]">
              No spending in {monthLabel}.
            </p>
          ) : (
            mix.map((slice) => (
              <div
                key={slice.name}
                className="flex items-center gap-[9px] text-[12px] leading-none"
              >
                <span
                  className="h-[9px] w-[9px] flex-none rounded-[2px]"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="min-w-0 flex-1 truncate">{slice.name}</span>
                <span className="font-mono text-[#3B3934] tabular-nums">
                  {formatCurrencyIntoYen(slice.total)}
                </span>
                <span className="w-[38px] text-right font-mono text-[#5C5952]">
                  {Math.round(slice.percentage)}%
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="flex min-w-0 flex-col gap-4">
        <div
          className={clsx(
            "grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-[#E3DFD7] transition-opacity",
            isFetching && "opacity-60",
          )}
        >
          <StatTile
            label="Income"
            value={formatCurrencyIntoYen(income)}
            valueClassName="text-[#0E7C66]"
          />
          <StatTile
            label="Spending"
            value={formatCurrencyIntoYen(spending)}
            valueClassName="text-[#B0442A]"
          />
        </div>

        <section className="overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-[10px] border-b border-[#E3DFD7] px-[18px] py-[14px]">
            <h2 className="text-[14px] leading-none font-semibold">
              Transactions{" "}
              <span className="font-mono text-[12px] font-normal text-[#5C5952]">
                {isFetching
                  ? "loading…"
                  : `${monthTransactions.length} ${monthTransactions.length === 1 ? "entry" : "entries"}`}
              </span>
            </h2>
            <div
              className="flex gap-1"
              role="group"
              aria-label="Filter by type"
            >
              {TYPE_FILTERS.map((filter) => {
                const isActive = typeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setTypeFilter(filter.id)}
                    className={clsx(
                      "h-7 cursor-pointer rounded-[7px] px-[10px] text-[11px] font-medium",
                      isActive
                        ? "bg-[#17161A] text-[#F7F5F1]"
                        : "border border-[#E3DFD7] bg-[#F7F5F1] text-[#6B6760]",
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto overscroll-contain">
            {isFetching ? (
              <TransactionRowsSkeleton />
            ) : loaded.error ? (
              <div className="flex items-start gap-[7px] px-[18px] py-6">
                <span className="mt-[5px] h-[5px] w-[5px] flex-none rounded-full bg-[#B0442A]" />
                <div>
                  <p className="text-[12px] leading-[1.4] text-[#9E3B21]">
                    {loaded.error}
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-[10px] cursor-pointer text-[12px] font-medium text-[#B04124] hover:text-[#8A331B]"
                  >
                    Retry now
                  </button>
                </div>
              </div>
            ) : rows.length === 0 ? (
              <p className="px-[18px] py-6 text-center text-[13px] text-[#6B6760]">
                {monthTransactions.length === 0
                  ? `No transactions in ${monthLabel}.`
                  : `No ${typeFilter} transactions in ${monthLabel}.`}
              </p>
            ) : (
              rows.map((transaction, index) => {
                const isIncome = transaction.type === "income";
                return (
                  <div
                    key={transaction.id}
                    className={clsx(
                      "flex items-center gap-[13px] px-[18px] py-3",
                      index !== rows.length - 1 && "border-b border-[#F1EEE8]",
                    )}
                  >
                    <div className="w-11 flex-none font-mono text-[11px] text-[#5C5952]">
                      {formatRowDate(transaction.date)}
                    </div>
                    <div className="flex-none rounded-[6px] bg-[#F4F1EA] px-2 py-[5px] font-mono text-[10px] tracking-[0.06em] whitespace-nowrap text-[#6B6760] uppercase">
                      {transaction.category_name || "—"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] leading-[1.3] font-medium">
                        {transaction.title}
                      </div>
                      {transaction.note && (
                        <div className="mt-[2px] truncate text-[11px] leading-[1.3] text-[#5C5952]">
                          {transaction.note}
                        </div>
                      )}
                    </div>
                    <div
                      className={clsx(
                        "flex-none font-mono text-[13px] font-medium tabular-nums",
                        isIncome ? "text-[#0E7C66]" : "text-[#17161A]",
                      )}
                    >
                      {isIncome ? "+" : "−"}
                      {formatCurrencyIntoYen(
                        Math.abs(Number(transaction.amount)),
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
