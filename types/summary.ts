import { Account } from "./account";
import { CategoryTotal } from "./transaction";

export interface MonthlyTransactionSummary {
  net: number;
  totalIncome: number;
  totalSpending: number;
  transactionCount: number;
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
