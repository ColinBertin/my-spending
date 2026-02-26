// ENUMS
export type AccountType = "single" | "shared";

export type Currency = "JPY" | "EUR" | "USD";

export type TransactionType = "expense" | "income";

// INTERFACES
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  createdAt: number;
}

export interface Account {
  id?: string;
  name: string;
  type: "single" | "shared" | "professional";
  currency: string;
  created_at?: string;
  updated_at?: string | null;
  account_members: { user_id: string }[];
}

export interface Transaction {
  id: string;
  title: string;
  account_id?: string;
  type: "income" | "expense";
  category_id?: string;
  category_name: string;
  category_icon?: string;
  category_icon_pack?: string;
  category_color?: string;
  amount: number;
  currency: string;
  date: Date;
  note?: string;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TransactionsByCategory = Record<string, Transaction[]>;

export interface CategoryTotal {
  category: string;
  total: number;
  category_icon?: string;
  category_icon_pack?: string;
  category_color?: string;
}

export interface MonthlyCategorySummary {
  categoryTotals: CategoryTotal[];
  totalSpending: number;
  selectedMonth: string;
  selectedYear: string;
}

export interface DashboardAccountSummary {
  account: Account;
  summary: MonthlyCategorySummary;
}

export interface Category {
  id: string;
  type?: "normal" | "professional";
  user_id?: string;
  name: string;
  color?: string;
  created_at?: Date;
  icon?: string;
  icon_pack?: string;
}
