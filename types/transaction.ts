export type TransactionType = "expense" | "income";

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
  type: TransactionType;
  total: number;
  percentage?: number;
  category_icon?: string;
  category_icon_pack?: string;
  category_color?: string;
}
