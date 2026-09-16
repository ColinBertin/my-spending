import { Account } from "./account";
import { CategoryTotal, TransactionType } from "./transaction";

export interface MonthlyTransactionSummary {
  net: number;
  totalIncome: number;
  totalSpending: number;
  transactionCount: number;
  categoryTotals: CategoryTotal[];
}

export interface MonthlyFlow {
  label: string;
  year: number;
  month: number;
  totalIncome: number;
  totalSpending: number;
}

export interface MonthlyCategorySummary {
  categoryTotals: CategoryTotal[];
  totalSpending: number;
  totalIncome: number;
  selectedMonth: string;
  selectedYear: string;
}

export interface DashboardAccountSummary {
  account: Account;
  summary: MonthlyCategorySummary;
  transactionCount: number;
}

export interface AccountMonthlySummary {
  id: string;
  name: string;
  type: "single" | "shared" | "professional";
  currency: string;
  entryCount: number;
  balance: number;
  income: number;
  spending: number;
  savedPercentage: number;
  spentPercentage: number;
}

export interface RecentActivityItem {
  id: string;
  date: string;
  category: string;
  title: string;
  accountName: string;
  amount: number;
  type: TransactionType;
}
