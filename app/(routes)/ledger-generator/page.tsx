import LedgerGenerator from "./ledger-generator";
import {
  getCurrentJanuaryRange,
  getPreviousYearRange,
  getProfessionalLedgerContext,
  getTransactionsForRange,
  groupTransactionsByCategory,
  isJanuaryAdjustmentCategoryLedgerName,
  isAccruedExpenseTransaction,
} from "./data";

export const metadata = {
  title: "Ledger Generator",
};

function sumIncomeAndSpending(
  transactions: Awaited<ReturnType<typeof getTransactionsForRange>>,
) {
  return transactions.reduce(
    (totals, transaction) => {
      const amount = Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        totals.totalIncome += amount;
      } else {
        totals.totalSpending += amount;
      }

      return totals;
    },
    { totalIncome: 0, totalSpending: 0 },
  );
}

export default async function LedgerGeneratorPage() {
  const { previousYear, startIso, endIso } = getPreviousYearRange();
  const {
    currentYear,
    startIso: januaryStartIso,
    endIso: januaryEndIso,
  } = getCurrentJanuaryRange();
  const { userId, professionalAccountId, categories } =
    await getProfessionalLedgerContext();
  const transactions = await getTransactionsForRange(
    userId,
    categories,
    professionalAccountId,
    { startIso, endIso },
  );
  const transactionsByCategory = groupTransactionsByCategory(
    categories,
    transactions,
  );
  const januaryTransactions = await getTransactionsForRange(
    userId,
    categories,
    professionalAccountId,
    { startIso: januaryStartIso, endIso: januaryEndIso },
  );
  const januaryAccountsReceivableCount = januaryTransactions.filter(
    (transaction) => transaction.type === "income",
  ).length;
  const januaryAccountsReceivableTransactions = januaryTransactions.filter(
    (transaction) => transaction.type === "income",
  );
  const januaryAccruedExpenseCount = januaryTransactions.filter(
    isAccruedExpenseTransaction,
  ).length;
  const januaryAccruedExpenseTransactions = januaryTransactions.filter(
    isAccruedExpenseTransaction,
  );
  const januaryAccountsReceivableTotals = sumIncomeAndSpending(
    januaryAccountsReceivableTransactions,
  );
  const januaryAccruedExpenseTotals = sumIncomeAndSpending(
    januaryAccruedExpenseTransactions,
  );
  const januaryCategoryPreviewTransactions = januaryTransactions.filter(
    (transaction) =>
      isJanuaryAdjustmentCategoryLedgerName(transaction.category_name),
  );
  const categoryPreviewTransactionsByCategory = groupTransactionsByCategory(
    categories,
    [...transactions, ...januaryCategoryPreviewTransactions],
  );

  return (
    <LedgerGenerator
      categoryPreviewTransactionsByCategory={
        categoryPreviewTransactionsByCategory
      }
      categories={categories}
      currentYear={currentYear}
      januaryAccountsReceivableCount={januaryAccountsReceivableCount}
      januaryAccountsReceivableIncome={
        januaryAccountsReceivableTotals.totalIncome
      }
      januaryAccountsReceivableSpending={
        januaryAccountsReceivableTotals.totalSpending
      }
      januaryAccruedExpenseCount={januaryAccruedExpenseCount}
      januaryAccruedExpenseIncome={januaryAccruedExpenseTotals.totalIncome}
      januaryAccruedExpenseSpending={januaryAccruedExpenseTotals.totalSpending}
      previousYear={previousYear}
      transactionsByCategory={transactionsByCategory}
    />
  );
}
