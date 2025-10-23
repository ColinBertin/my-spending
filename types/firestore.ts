// ENUMS
export enum AccountType {
  SINGLE = "single",
  SHARED = "shared",
}

export enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
}

// INTERFACES
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  createdAt: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  members: string[];
  currency: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  amount: number;
  currency: string;
  date: Date;
  note?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}
