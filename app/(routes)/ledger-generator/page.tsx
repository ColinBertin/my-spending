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
  const januaryAccruedExpenseCount = januaryTransactions.filter(
    isAccruedExpenseTransaction,
  ).length;
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
      januaryAccruedExpenseCount={januaryAccruedExpenseCount}
      previousYear={previousYear}
      transactionsByCategory={transactionsByCategory}
    />
  );
}
