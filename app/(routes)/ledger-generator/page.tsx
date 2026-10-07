import { sumIncomeAndSpending } from "@/helpers";
import LedgerGenerator from "./ledger-generator";
import { getProfessionalAccountName } from "./ledger-preview";
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

export default async function LedgerGeneratorPage() {
  const { previousYear, startIso, endIso } = getPreviousYearRange();
  const {
    currentYear,
    startIso: januaryStartIso,
    endIso: januaryEndIso,
  } = getCurrentJanuaryRange();
  const { userId, professionalAccountId, categories } =
    await getProfessionalLedgerContext();
  const [professionalAccountName, transactions] = await Promise.all([
    getProfessionalAccountName(professionalAccountId),
    getTransactionsForRange(userId, categories, professionalAccountId, {
      startIso,
      endIso,
    }),
  ]);
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
      hasProfessionalAccount={professionalAccountId !== null}
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
      professionalAccountName={professionalAccountName}
      transactionsByCategory={transactionsByCategory}
    />
  );
}
