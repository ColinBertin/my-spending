import type { Account, Category, Transaction } from "@/types/firestore";
import type { AuthUser } from "@/utils/authTypes";

export const isMockEnabled = () => process.env.NEXT_PUBLIC_USE_MOCK === "true";

const DEFAULT_USER: AuthUser = {
  id: "mock-user-1",
  email: "demo@mock.local",
  user_metadata: { username: "Demo" },
};

let currentUser: AuthUser | null = null;
const listeners = new Set<(user: AuthUser | null) => void>();

function notifyAuthListeners() {
  listeners.forEach((listener) => listener(currentUser));
}

export const mockAuth = {
  getUser() {
    return currentUser;
  },
  subscribe(listener: (user: AuthUser | null) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  async signIn({
    email,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: AuthUser | null; error: string | null }> {
    const username = email.split("@")[0] || "Demo";
    currentUser = {
      ...DEFAULT_USER,
      email,
      user_metadata: { username },
    };
    notifyAuthListeners();
    return { user: currentUser, error: null };
  },
  async signUp({
    email,
    username,
  }: {
    email: string;
    password: string;
    username: string;
  }): Promise<{ user: AuthUser | null; error: string | null }> {
    currentUser = {
      ...DEFAULT_USER,
      email,
      user_metadata: { username },
    };
    notifyAuthListeners();
    return { user: currentUser, error: null };
  },
  async signOut(): Promise<{ error: string | null }> {
    currentUser = null;
    notifyAuthListeners();
    return { error: null };
  },
};

const now = new Date();

let mockAccounts: Account[] = [
  {
    id: "acct-1",
    name: "Personal",
    type: "single",
    members: [DEFAULT_USER.id],
    currency: "JPY",
    createdAt: now,
  },
  {
    id: "acct-2",
    name: "Shared",
    type: "shared",
    members: [DEFAULT_USER.id, "mock-user-2"],
    currency: "USD",
    createdAt: now,
  },
];

let mockCategories: Category[] = [
  {
    id: "cat-1",
    userId: DEFAULT_USER.id,
    name: "Food",
    color: "coral",
    icon: "FaPizzaSlice",
    iconPack: "fa",
    createdAt: now,
  },
  {
    id: "cat-2",
    userId: DEFAULT_USER.id,
    name: "Transport",
    color: "sky",
    icon: "FaBus",
    iconPack: "fa",
    createdAt: now,
  },
  {
    id: "cat-3",
    userId: DEFAULT_USER.id,
    name: "Salary",
    color: "mint",
    icon: "FaMoneyBillWave",
    iconPack: "fa",
    createdAt: now,
  },
];

let mockTransactions: Transaction[] = [
  {
    id: "txn-1",
    title: "Groceries",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-1",
    categoryName: "Food",
    categoryIcon: "FaPizzaSlice",
    categoryIconPack: "fa",
    categoryColor: "coral",
    amount: 3200,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 2),
    note: "Weekly groceries",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 2),
  },
  {
    id: "txn-2",
    title: "Train pass",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-2",
    categoryName: "Transport",
    categoryIcon: "FaBus",
    categoryIconPack: "fa",
    categoryColor: "sky",
    amount: 4800,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 5),
    note: "Monthly commuter",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 5),
  },
  {
    id: "txn-3",
    title: "Salary",
    accountId: "acct-1",
    type: "income",
    categoryId: "cat-3",
    categoryName: "Salary",
    categoryIcon: "FaMoneyBillWave",
    categoryIconPack: "fa",
    categoryColor: "mint",
    amount: 250000,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 1),
    note: "Monthly income",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
  },
];

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getMockAccountsForUser(userId: string) {
  return mockAccounts.filter((account) => account.members.includes(userId));
}

export function getMockAccountById(id: string) {
  return mockAccounts.find((account) => account.id === id);
}

export function getMockCategoriesForUser(userId: string) {
  return mockCategories.filter((category) => category.userId === userId);
}

export function getMockTransactionsForAccount(accountId: string) {
  return mockTransactions.filter(
    (transaction) => transaction.accountId === accountId,
  );
}

export function getMockTransactionsForAccountInRange(
  accountId: string,
  start: Date,
  end: Date,
) {
  return mockTransactions.filter((transaction) => {
    if (transaction.accountId !== accountId) return false;
    const transactionDate =
      transaction.date instanceof Date
        ? transaction.date
        : new Date(transaction.date);
    return transactionDate >= start && transactionDate <= end;
  });
}

export function createMockAccount(account: Account) {
  const id = generateId("acct");
  const nextAccount = {
    ...account,
    id,
    createdAt: account.createdAt ?? new Date(),
  };
  mockAccounts = [...mockAccounts, nextAccount];
  return id;
}

export function createMockCategory(category: Category) {
  const id = generateId("cat");
  const nextCategory = {
    ...category,
    id,
    createdAt: category.createdAt ?? new Date(),
  };
  mockCategories = [...mockCategories, nextCategory];
  return id;
}

export function createMockTransaction(transaction: Transaction) {
  const id = generateId("txn");
  const nextTransaction = {
    ...transaction,
    id,
    createdAt: transaction.createdAt ?? new Date(),
  };
  mockTransactions = [...mockTransactions, nextTransaction];
  return id;
}
