import LedgerGenerator from "./ledger-generator";
import {
  getPreviousYearRange,
  getProfessionalLedgerContext,
  getTransactionsForRange,
  groupTransactionsByCategory,
} from "./data";

export const metadata = {
  title: "Ledger Generator",
};

export default async function LedgerGeneratorPage() {
  const { previousYear, startIso, endIso } = getPreviousYearRange();
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

  return (
    <LedgerGenerator
      categories={categories}
      previousYear={previousYear}
      transactionsByCategory={transactionsByCategory}
    />
  );
}
