import { Timestamp } from "firebase/firestore";

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
  type: AccountType;
  members: string[];
  currency: string;
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface Transaction {
  id: string;
  title: string;
  accountId: string;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
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
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
  icon?: string;
}
