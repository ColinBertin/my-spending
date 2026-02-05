import type { Account, Category, Transaction } from "@/types/firestore";
import type { AuthUser } from "@/utils/authTypes";

export const isMockEnabled = () => process.env.NEXT_PUBLIC_USE_MOCK === "true";

const DEFAULT_USER: AuthUser = {
  id: "mock-user-1",
  email: "demo@mock.com",
  user_metadata: { username: "Demo" },
};

const SECOND_USER: AuthUser = {
  id: "mock-user-2",
  email: "alex@mock.com",
  user_metadata: { username: "Alex" },
};

const MOCK_PASSWORDS: Record<string, string> = {
  "demo@mock.com": "Demo123!",
  "alex@mock.com": "Alex123!",
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
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: AuthUser | null; error: string | null }> {
    const expectedPassword = MOCK_PASSWORDS[email];
    if (!expectedPassword) {
      return { user: null, error: "Unknown mock user email." };
    }

    if (password !== expectedPassword) {
      return { user: null, error: "Invalid mock password." };
    }

    currentUser = email === SECOND_USER.email ? SECOND_USER : DEFAULT_USER;
    notifyAuthListeners();
    return { user: currentUser, error: null };
  },
  async signUp({
    email,
    username,
    password,
  }: {
    email: string;
    password: string;
    username: string;
  }): Promise<{ user: AuthUser | null; error: string | null }> {
    const expectedPassword = MOCK_PASSWORDS[email];
    if (expectedPassword && password !== expectedPassword) {
      return { user: null, error: "Invalid mock password." };
    }

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
    id: "acct-3",
    name: "Alex Personal",
    type: "single",
    members: [SECOND_USER.id],
    currency: "EUR",
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
  {
    id: "cat-4",
    userId: DEFAULT_USER.id,
    name: "Coffee",
    color: "pumpkin",
    icon: "FaCoffee",
    iconPack: "fa",
    createdAt: now,
  },
  {
    id: "cat-5",
    userId: DEFAULT_USER.id,
    name: "Entertainment",
    color: "lavender",
    icon: "FaGamepad",
    iconPack: "fa",
    createdAt: now,
  },
  {
    id: "cat-6",
    userId: SECOND_USER.id,
    name: "Rent",
    color: "slate",
    icon: "MdOutlineApartment",
    iconPack: "md",
    createdAt: now,
  },
  {
    id: "cat-7",
    userId: SECOND_USER.id,
    name: "Groceries",
    color: "peach",
    icon: "FaAppleAlt",
    iconPack: "fa",
    createdAt: now,
  },
  {
    id: "cat-8",
    userId: SECOND_USER.id,
    name: "Travel",
    color: "ocean",
    icon: "FaPlane",
    iconPack: "fa",
    createdAt: now,
  },
  {
    id: "cat-9",
    userId: SECOND_USER.id,
    name: "Fitness",
    color: "lime",
    icon: "FaDumbbell",
    iconPack: "fa",
    createdAt: now,
  },
  {
    id: "cat-10",
    userId: SECOND_USER.id,
    name: "Salary",
    color: "mint",
    icon: "FaMoneyBillWave",
    iconPack: "fa",
    createdAt: now,
  },
];

const monthOffsets = [-3, -2, -1, 0, 1, 2, 3];

function makeDate(monthOffset: number, day: number) {
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, day);
}

const baseTransactions: Transaction[] = [
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
  {
    id: "txn-4",
    title: "Morning coffee",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-4",
    categoryName: "Coffee",
    categoryIcon: "FaCoffee",
    categoryIconPack: "fa",
    categoryColor: "pumpkin",
    amount: 520,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 7),
    note: "Cafe stop",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 7),
  },
  {
    id: "txn-5",
    title: "Movie night",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-5",
    categoryName: "Entertainment",
    categoryIcon: "FaGamepad",
    categoryIconPack: "fa",
    categoryColor: "lavender",
    amount: 1800,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 12),
    note: "Streaming rental",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 12),
  },
  {
    id: "txn-6",
    title: "Dinner out",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-1",
    categoryName: "Food",
    categoryIcon: "FaPizzaSlice",
    categoryIconPack: "fa",
    categoryColor: "coral",
    amount: 4200,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 15),
    note: "Ramen",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 15),
  },
  {
    id: "txn-7",
    title: "Metro top-up",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-2",
    categoryName: "Transport",
    categoryIcon: "FaBus",
    categoryIconPack: "fa",
    categoryColor: "sky",
    amount: 3000,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 18),
    note: "Transit card",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 18),
  },
  {
    id: "txn-8",
    title: "Weekend brunch",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-1",
    categoryName: "Food",
    categoryIcon: "FaPizzaSlice",
    categoryIconPack: "fa",
    categoryColor: "coral",
    amount: 2600,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 22),
    note: "Cafe",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 22),
  },
  {
    id: "txn-9",
    title: "Book purchase",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-5",
    categoryName: "Entertainment",
    categoryIcon: "FaGamepad",
    categoryIconPack: "fa",
    categoryColor: "lavender",
    amount: 1400,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 25),
    note: "New release",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 25),
  },
  {
    id: "txn-10",
    title: "Side project payout",
    accountId: "acct-1",
    type: "income",
    categoryId: "cat-3",
    categoryName: "Salary",
    categoryIcon: "FaMoneyBillWave",
    categoryIconPack: "fa",
    categoryColor: "mint",
    amount: 45000,
    currency: "JPY",
    date: new Date(now.getFullYear(), now.getMonth(), 27),
    note: "Freelance",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 27),
  },
  {
    id: "txn-11",
    title: "Rent",
    accountId: "acct-3",
    type: "expense",
    categoryId: "cat-6",
    categoryName: "Rent",
    categoryIcon: "MdOutlineApartment",
    categoryIconPack: "md",
    categoryColor: "slate",
    amount: 950,
    currency: "EUR",
    date: new Date(now.getFullYear(), now.getMonth(), 1),
    note: "Monthly rent",
    createdBy: SECOND_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
  },
  {
    id: "txn-12",
    title: "Grocery run",
    accountId: "acct-3",
    type: "expense",
    categoryId: "cat-7",
    categoryName: "Groceries",
    categoryIcon: "FaAppleAlt",
    categoryIconPack: "fa",
    categoryColor: "peach",
    amount: 68,
    currency: "EUR",
    date: new Date(now.getFullYear(), now.getMonth(), 4),
    note: "Weekly groceries",
    createdBy: SECOND_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 4),
  },
  {
    id: "txn-13",
    title: "Gym membership",
    accountId: "acct-3",
    type: "expense",
    categoryId: "cat-9",
    categoryName: "Fitness",
    categoryIcon: "FaDumbbell",
    categoryIconPack: "fa",
    categoryColor: "lime",
    amount: 45,
    currency: "EUR",
    date: new Date(now.getFullYear(), now.getMonth(), 6),
    note: "Monthly plan",
    createdBy: SECOND_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 6),
  },
  {
    id: "txn-14",
    title: "Weekend trip",
    accountId: "acct-3",
    type: "expense",
    categoryId: "cat-8",
    categoryName: "Travel",
    categoryIcon: "FaPlane",
    categoryIconPack: "fa",
    categoryColor: "ocean",
    amount: 220,
    currency: "EUR",
    date: new Date(now.getFullYear(), now.getMonth(), 11),
    note: "Train + hotel",
    createdBy: SECOND_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 11),
  },
  {
    id: "txn-15",
    title: "Salary",
    accountId: "acct-3",
    type: "income",
    categoryId: "cat-10",
    categoryName: "Salary",
    categoryIcon: "FaMoneyBillWave",
    categoryIconPack: "fa",
    categoryColor: "mint",
    amount: 3200,
    currency: "EUR",
    date: new Date(now.getFullYear(), now.getMonth(), 1),
    note: "Monthly income",
    createdBy: SECOND_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
  },
  {
    id: "txn-16",
    title: "Team dinner",
    accountId: "acct-2",
    type: "expense",
    categoryId: "cat-1",
    categoryName: "Food",
    categoryIcon: "FaPizzaSlice",
    categoryIconPack: "fa",
    categoryColor: "coral",
    amount: 120,
    currency: "USD",
    date: new Date(now.getFullYear(), now.getMonth(), 3),
    note: "Shared meal",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 3),
  },
  {
    id: "txn-17",
    title: "Shared groceries",
    accountId: "acct-2",
    type: "expense",
    categoryId: "cat-7",
    categoryName: "Groceries",
    categoryIcon: "FaAppleAlt",
    categoryIconPack: "fa",
    categoryColor: "peach",
    amount: 85,
    currency: "USD",
    date: new Date(now.getFullYear(), now.getMonth(), 8),
    note: "Stocked the fridge",
    createdBy: SECOND_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 8),
  },
  {
    id: "txn-18",
    title: "Streaming subscription",
    accountId: "acct-2",
    type: "expense",
    categoryId: "cat-5",
    categoryName: "Entertainment",
    categoryIcon: "FaGamepad",
    categoryIconPack: "fa",
    categoryColor: "lavender",
    amount: 14,
    currency: "USD",
    date: new Date(now.getFullYear(), now.getMonth(), 14),
    note: "Monthly subscription",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 14),
  },
  {
    id: "txn-19",
    title: "Shared utilities",
    accountId: "acct-2",
    type: "expense",
    categoryId: "cat-2",
    categoryName: "Transport",
    categoryIcon: "FaBus",
    categoryIconPack: "fa",
    categoryColor: "sky",
    amount: 60,
    currency: "USD",
    date: new Date(now.getFullYear(), now.getMonth(), 20),
    note: "Internet bill",
    createdBy: SECOND_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 20),
  },
  {
    id: "txn-20",
    title: "Shared savings",
    accountId: "acct-2",
    type: "income",
    categoryId: "cat-3",
    categoryName: "Salary",
    categoryIcon: "FaMoneyBillWave",
    categoryIconPack: "fa",
    categoryColor: "mint",
    amount: 300,
    currency: "USD",
    date: new Date(now.getFullYear(), now.getMonth(), 26),
    note: "Savings contribution",
    createdBy: DEFAULT_USER.id,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 26),
  },
];

const generatedTransactions: Transaction[] = [];
let generatedId = 1000;

function pushGeneratedTransaction(transaction: Omit<Transaction, "id">) {
  generatedTransactions.push({
    id: `txn-${generatedId++}`,
    ...transaction,
  });
}

monthOffsets.forEach((offset) => {
  const salaryDate = makeDate(offset, 1);
  const midDate = makeDate(offset, 12);
  const lateDate = makeDate(offset, 22);

  // User 1 - Personal account
  pushGeneratedTransaction({
    title: "Salary",
    accountId: "acct-1",
    type: "income",
    categoryId: "cat-3",
    categoryName: "Salary",
    categoryIcon: "FaMoneyBillWave",
    categoryIconPack: "fa",
    categoryColor: "mint",
    amount: 250000 + offset * 2500,
    currency: "JPY",
    date: salaryDate,
    note: "Monthly income",
    createdBy: DEFAULT_USER.id,
    createdAt: salaryDate,
  });

  pushGeneratedTransaction({
    title: "Groceries",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-1",
    categoryName: "Food",
    categoryIcon: "FaPizzaSlice",
    categoryIconPack: "fa",
    categoryColor: "coral",
    amount: 2800 + offset * 120,
    currency: "JPY",
    date: midDate,
    note: "Weekly groceries",
    createdBy: DEFAULT_USER.id,
    createdAt: midDate,
  });

  pushGeneratedTransaction({
    title: "Transit pass",
    accountId: "acct-1",
    type: "expense",
    categoryId: "cat-2",
    categoryName: "Transport",
    categoryIcon: "FaBus",
    categoryIconPack: "fa",
    categoryColor: "sky",
    amount: 4600 + offset * 80,
    currency: "JPY",
    date: lateDate,
    note: "Monthly transport",
    createdBy: DEFAULT_USER.id,
    createdAt: lateDate,
  });

  // User 2 - Personal account
  pushGeneratedTransaction({
    title: "Salary",
    accountId: "acct-3",
    type: "income",
    categoryId: "cat-10",
    categoryName: "Salary",
    categoryIcon: "FaMoneyBillWave",
    categoryIconPack: "fa",
    categoryColor: "mint",
    amount: 3200 + offset * 40,
    currency: "EUR",
    date: salaryDate,
    note: "Monthly income",
    createdBy: SECOND_USER.id,
    createdAt: salaryDate,
  });

  pushGeneratedTransaction({
    title: "Rent",
    accountId: "acct-3",
    type: "expense",
    categoryId: "cat-6",
    categoryName: "Rent",
    categoryIcon: "MdOutlineApartment",
    categoryIconPack: "md",
    categoryColor: "slate",
    amount: 950,
    currency: "EUR",
    date: makeDate(offset, 2),
    note: "Monthly rent",
    createdBy: SECOND_USER.id,
    createdAt: makeDate(offset, 2),
  });

  pushGeneratedTransaction({
    title: "Groceries",
    accountId: "acct-3",
    type: "expense",
    categoryId: "cat-7",
    categoryName: "Groceries",
    categoryIcon: "FaAppleAlt",
    categoryIconPack: "fa",
    categoryColor: "peach",
    amount: 70 + offset * 2,
    currency: "EUR",
    date: makeDate(offset, 8),
    note: "Weekly groceries",
    createdBy: SECOND_USER.id,
    createdAt: makeDate(offset, 8),
  });

  // Shared account
  pushGeneratedTransaction({
    title: "Shared groceries",
    accountId: "acct-2",
    type: "expense",
    categoryId: "cat-7",
    categoryName: "Groceries",
    categoryIcon: "FaAppleAlt",
    categoryIconPack: "fa",
    categoryColor: "peach",
    amount: 80 + offset * 3,
    currency: "USD",
    date: makeDate(offset, 6),
    note: "Household groceries",
    createdBy: SECOND_USER.id,
    createdAt: makeDate(offset, 6),
  });

  pushGeneratedTransaction({
    title: "Dinner out",
    accountId: "acct-2",
    type: "expense",
    categoryId: "cat-1",
    categoryName: "Food",
    categoryIcon: "FaPizzaSlice",
    categoryIconPack: "fa",
    categoryColor: "coral",
    amount: 110 + offset * 5,
    currency: "USD",
    date: makeDate(offset, 15),
    note: "Shared meal",
    createdBy: DEFAULT_USER.id,
    createdAt: makeDate(offset, 15),
  });

  pushGeneratedTransaction({
    title: "Streaming subscription",
    accountId: "acct-2",
    type: "expense",
    categoryId: "cat-5",
    categoryName: "Entertainment",
    categoryIcon: "FaGamepad",
    categoryIconPack: "fa",
    categoryColor: "lavender",
    amount: 14,
    currency: "USD",
    date: makeDate(offset, 21),
    note: "Monthly subscription",
    createdBy: DEFAULT_USER.id,
    createdAt: makeDate(offset, 21),
  });
});

let mockTransactions: Transaction[] = [
  ...baseTransactions,
  ...generatedTransactions,
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
