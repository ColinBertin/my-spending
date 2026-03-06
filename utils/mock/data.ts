import type {
  Account,
  Category,
  CategoryTotal,
  DashboardAccountSummary,
  MonthlyCategorySummary,
  Transaction,
} from "@/types";
import { MOCK_USER_ID } from "./constants";

type AccountMember = {
  account_id: string;
  user_id: string;
};

type MockState = {
  accounts: Account[];
  accountMembers: AccountMember[];
  categories: Category[];
  transactions: Transaction[];
};

export { MOCK_USER_ID } from "./constants";

const GLOBAL_MOCK_STATE_KEY = "__MY_SPENDING_MOCK_STATE__";

function createSeedState(): MockState {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const d = (
    monthOffset: number,
    day: number,
    hour = 12,
    minute = 0,
    second = 0,
  ) => new Date(Date.UTC(year, month + monthOffset, day, hour, minute, second));

  const categories: Category[] = [
    {
      id: "mock-cat-food",
      user_id: MOCK_USER_ID,
      name: "Food",
      color: "#ef4444",
      icon: "UtensilsCrossed",
      icon_pack: "lucide",
      created_at: d(-2, 3),
    },
    {
      id: "mock-cat-transport",
      user_id: MOCK_USER_ID,
      name: "Transport",
      color: "#3b82f6",
      icon: "Bus",
      icon_pack: "lucide",
      created_at: d(-2, 5),
    },
    {
      id: "mock-cat-salary",
      user_id: MOCK_USER_ID,
      name: "Salary",
      color: "#10b981",
      icon: "Wallet",
      icon_pack: "lucide",
      created_at: d(-2, 8),
    },
    {
      id: "mock-cat-rent",
      user_id: MOCK_USER_ID,
      name: "Rent",
      color: "#6366f1",
      icon: "Home",
      icon_pack: "lucide",
      created_at: d(-2, 9),
    },
    {
      id: "mock-cat-utilities",
      user_id: MOCK_USER_ID,
      name: "Utilities",
      color: "#0ea5e9",
      icon: "Lightbulb",
      icon_pack: "lucide",
      created_at: d(-2, 10),
    },
    {
      id: "mock-cat-entertainment",
      user_id: MOCK_USER_ID,
      name: "Entertainment",
      color: "#f59e0b",
      icon: "Film",
      icon_pack: "lucide",
      created_at: d(-2, 12),
    },
    {
      id: "mock-cat-health",
      user_id: MOCK_USER_ID,
      name: "Health",
      color: "#22c55e",
      icon: "HeartPulse",
      icon_pack: "lucide",
      created_at: d(-2, 13),
    },
    {
      id: "mock-cat-household",
      user_id: MOCK_USER_ID,
      name: "Household",
      color: "#f97316",
      icon: "Package",
      icon_pack: "lucide",
      created_at: d(-2, 14),
    },
    {
      id: "mock-cat-client-income",
      user_id: MOCK_USER_ID,
      name: "Client Income",
      color: "#14b8a6",
      icon: "BriefcaseBusiness",
      icon_pack: "lucide",
      created_at: d(-2, 16),
    },
    {
      id: "mock-cat-business-tools",
      user_id: MOCK_USER_ID,
      name: "Business Tools",
      color: "#a855f7",
      icon: "Laptop",
      icon_pack: "lucide",
      created_at: d(-2, 17),
    },
    {
      id: "mock-cat-business-travel",
      user_id: MOCK_USER_ID,
      name: "Business Travel",
      color: "#06b6d4",
      icon: "Plane",
      icon_pack: "lucide",
      created_at: d(-2, 18),
    },
  ];

  const accounts: Account[] = [
    {
      id: "mock-acc-main",
      name: "Main Account",
      type: "single",
      currency: "USD",
      created_at: d(-3, 1).toISOString(),
      updated_at: d(0, 1).toISOString(),
      account_members: [{ user_id: MOCK_USER_ID }],
    },
    {
      id: "mock-acc-joint",
      name: "Shared Account",
      type: "shared",
      currency: "EUR",
      created_at: d(-3, 8).toISOString(),
      updated_at: d(0, 2).toISOString(),
      account_members: [{ user_id: MOCK_USER_ID }],
    },
    {
      id: "mock-acc-business",
      name: "Pro Account",
      type: "professional",
      currency: "USD",
      created_at: d(-3, 15).toISOString(),
      updated_at: d(0, 3).toISOString(),
      account_members: [{ user_id: MOCK_USER_ID }],
    },
  ];

  const accountMembers: AccountMember[] = accounts
    .filter((account): account is Account & { id: string } =>
      Boolean(account.id),
    )
    .map((account) => ({
      account_id: account.id,
      user_id: MOCK_USER_ID,
    }));

  const transactions: Transaction[] = [
    // Previous month (single account)
    {
      id: "mock-tx-prev-1",
      title: "Monthly Salary",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "income",
      category_id: "mock-cat-salary",
      category_name: "Salary",
      category_icon: "Wallet",
      category_icon_pack: "lucide",
      category_color: "#10b981",
      amount: 3850,
      currency: "USD",
      date: d(-1, 1, 8, 30, 0),
      note: "Employer payroll",
      created_at: d(-1, 1, 8, 35, 0),
      updated_at: d(-1, 1, 8, 35, 0),
    },
    {
      id: "mock-tx-prev-2",
      title: "Rent Payment",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-rent",
      category_name: "Rent",
      category_icon: "Home",
      category_icon_pack: "lucide",
      category_color: "#6366f1",
      amount: 1450,
      currency: "USD",
      date: d(-1, 2, 9, 10, 0),
      note: "Apartment rent",
      created_at: d(-1, 2, 9, 12, 0),
      updated_at: d(-1, 2, 9, 12, 0),
    },
    {
      id: "mock-tx-prev-3",
      title: "Electric + Water Bill",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-utilities",
      category_name: "Utilities",
      category_icon: "Lightbulb",
      category_icon_pack: "lucide",
      category_color: "#0ea5e9",
      amount: 128.3,
      currency: "USD",
      date: d(-1, 5, 10, 15, 0),
      note: "",
      created_at: d(-1, 5, 10, 20, 0),
      updated_at: d(-1, 5, 10, 20, 0),
    },
    {
      id: "mock-tx-prev-4",
      title: "Supermarket",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-food",
      category_name: "Food",
      category_icon: "UtensilsCrossed",
      category_icon_pack: "lucide",
      category_color: "#ef4444",
      amount: 96.4,
      currency: "USD",
      date: d(-1, 9, 18, 40, 0),
      note: "Groceries and household basics",
      created_at: d(-1, 9, 18, 45, 0),
      updated_at: d(-1, 9, 18, 45, 0),
    },
    {
      id: "mock-tx-prev-5",
      title: "Metro Top-up",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-transport",
      category_name: "Transport",
      category_icon: "Bus",
      category_icon_pack: "lucide",
      category_color: "#3b82f6",
      amount: 42,
      currency: "USD",
      date: d(-1, 12, 7, 35, 0),
      note: "",
      created_at: d(-1, 12, 7, 38, 0),
      updated_at: d(-1, 12, 7, 38, 0),
    },
    {
      id: "mock-tx-prev-6",
      title: "Movie Night",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-entertainment",
      category_name: "Entertainment",
      category_icon: "Film",
      category_icon_pack: "lucide",
      category_color: "#f59e0b",
      amount: 29.5,
      currency: "USD",
      date: d(-1, 18, 20, 0, 0),
      note: "Two tickets",
      created_at: d(-1, 18, 20, 2, 0),
      updated_at: d(-1, 18, 20, 2, 0),
    },
    {
      id: "mock-tx-prev-7",
      title: "Gym Membership",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-health",
      category_name: "Health",
      category_icon: "HeartPulse",
      category_icon_pack: "lucide",
      category_color: "#22c55e",
      amount: 38,
      currency: "USD",
      date: d(-1, 20, 9, 0, 0),
      note: "",
      created_at: d(-1, 20, 9, 2, 0),
      updated_at: d(-1, 20, 9, 2, 0),
    },

    // Previous month (shared account)
    {
      id: "mock-tx-prev-8",
      title: "Shared Groceries",
      account_id: "mock-acc-joint",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-food",
      category_name: "Food",
      category_icon: "UtensilsCrossed",
      category_icon_pack: "lucide",
      category_color: "#ef4444",
      amount: 132.8,
      currency: "EUR",
      date: d(-1, 7, 17, 35, 0),
      note: "",
      created_at: d(-1, 7, 17, 40, 0),
      updated_at: d(-1, 7, 17, 40, 0),
    },
    {
      id: "mock-tx-prev-9",
      title: "Internet Bill",
      account_id: "mock-acc-joint",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-utilities",
      category_name: "Utilities",
      category_icon: "Lightbulb",
      category_icon_pack: "lucide",
      category_color: "#0ea5e9",
      amount: 54.9,
      currency: "EUR",
      date: d(-1, 11, 10, 0, 0),
      note: "",
      created_at: d(-1, 11, 10, 3, 0),
      updated_at: d(-1, 11, 10, 3, 0),
    },
    {
      id: "mock-tx-prev-10",
      title: "Home Supplies",
      account_id: "mock-acc-joint",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-household",
      category_name: "Household",
      category_icon: "Package",
      category_icon_pack: "lucide",
      category_color: "#f97316",
      amount: 46.2,
      currency: "EUR",
      date: d(-1, 23, 15, 10, 0),
      note: "Cleaning and paper goods",
      created_at: d(-1, 23, 15, 12, 0),
      updated_at: d(-1, 23, 15, 12, 0),
    },

    // Previous month (professional account)
    {
      id: "mock-tx-prev-11",
      title: "Client Retainer",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "income",
      category_id: "mock-cat-client-income",
      category_name: "Client Income",
      category_icon: "BriefcaseBusiness",
      category_icon_pack: "lucide",
      category_color: "#14b8a6",
      amount: 2200,
      currency: "USD",
      date: d(-1, 3, 9, 0, 0),
      note: "Monthly retainer",
      created_at: d(-1, 3, 9, 5, 0),
      updated_at: d(-1, 3, 9, 5, 0),
    },
    {
      id: "mock-tx-prev-12",
      title: "Design Tool Subscription",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-business-tools",
      category_name: "Business Tools",
      category_icon: "Laptop",
      category_icon_pack: "lucide",
      category_color: "#a855f7",
      amount: 49,
      currency: "USD",
      date: d(-1, 4, 8, 10, 0),
      note: "",
      created_at: d(-1, 4, 8, 12, 0),
      updated_at: d(-1, 4, 8, 12, 0),
    },
    {
      id: "mock-tx-prev-13",
      title: "Coworking Day Pass",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-business-travel",
      category_name: "Business Travel",
      category_icon: "Plane",
      category_icon_pack: "lucide",
      category_color: "#06b6d4",
      amount: 32,
      currency: "USD",
      date: d(-1, 15, 9, 40, 0),
      note: "",
      created_at: d(-1, 15, 9, 42, 0),
      updated_at: d(-1, 15, 9, 42, 0),
    },

    // Current month (single account)
    {
      id: "mock-tx-current-1",
      title: "Monthly Salary",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "income",
      category_id: "mock-cat-salary",
      category_name: "Salary",
      category_icon: "Wallet",
      category_icon_pack: "lucide",
      category_color: "#10b981",
      amount: 3850,
      currency: "USD",
      date: d(0, 1, 8, 30, 0),
      note: "Employer payroll",
      created_at: d(0, 1, 8, 35, 0),
      updated_at: d(0, 1, 8, 35, 0),
    },
    {
      id: "mock-tx-current-2",
      title: "Rent Payment",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-rent",
      category_name: "Rent",
      category_icon: "Home",
      category_icon_pack: "lucide",
      category_color: "#6366f1",
      amount: 1450,
      currency: "USD",
      date: d(0, 2, 9, 10, 0),
      note: "Apartment rent",
      created_at: d(0, 2, 9, 12, 0),
      updated_at: d(0, 2, 9, 12, 0),
    },
    {
      id: "mock-tx-current-3",
      title: "Supermarket",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-food",
      category_name: "Food",
      category_icon: "UtensilsCrossed",
      category_icon_pack: "lucide",
      category_color: "#ef4444",
      amount: 112.9,
      currency: "USD",
      date: d(0, 6, 18, 35, 0),
      note: "",
      created_at: d(0, 6, 18, 38, 0),
      updated_at: d(0, 6, 18, 38, 0),
    },
    {
      id: "mock-tx-current-4",
      title: "Coffee and Lunch",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-food",
      category_name: "Food",
      category_icon: "UtensilsCrossed",
      category_icon_pack: "lucide",
      category_color: "#ef4444",
      amount: 24.6,
      currency: "USD",
      date: d(0, 10, 12, 20, 0),
      note: "Office day",
      created_at: d(0, 10, 12, 24, 0),
      updated_at: d(0, 10, 12, 24, 0),
    },
    {
      id: "mock-tx-current-5",
      title: "Ride Share",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-transport",
      category_name: "Transport",
      category_icon: "Bus",
      category_icon_pack: "lucide",
      category_color: "#3b82f6",
      amount: 18.75,
      currency: "USD",
      date: d(0, 13, 19, 10, 0),
      note: "",
      created_at: d(0, 13, 19, 12, 0),
      updated_at: d(0, 13, 19, 12, 0),
    },
    {
      id: "mock-tx-current-6",
      title: "Video Streaming",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-entertainment",
      category_name: "Entertainment",
      category_icon: "Film",
      category_icon_pack: "lucide",
      category_color: "#f59e0b",
      amount: 15.99,
      currency: "USD",
      date: d(0, 16, 7, 45, 0),
      note: "",
      created_at: d(0, 16, 7, 47, 0),
      updated_at: d(0, 16, 7, 47, 0),
    },
    {
      id: "mock-tx-current-7",
      title: "Pharmacy",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-health",
      category_name: "Health",
      category_icon: "HeartPulse",
      category_icon_pack: "lucide",
      category_color: "#22c55e",
      amount: 27.4,
      currency: "USD",
      date: d(0, 21, 13, 0, 0),
      note: "",
      created_at: d(0, 21, 13, 4, 0),
      updated_at: d(0, 21, 13, 4, 0),
    },

    // Current month (shared account)
    {
      id: "mock-tx-current-8",
      title: "Shared Groceries",
      account_id: "mock-acc-joint",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-food",
      category_name: "Food",
      category_icon: "UtensilsCrossed",
      category_icon_pack: "lucide",
      category_color: "#ef4444",
      amount: 141.2,
      currency: "EUR",
      date: d(0, 5, 17, 35, 0),
      note: "",
      created_at: d(0, 5, 17, 40, 0),
      updated_at: d(0, 5, 17, 40, 0),
    },
    {
      id: "mock-tx-current-9",
      title: "Dinner Out",
      account_id: "mock-acc-joint",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-food",
      category_name: "Food",
      category_icon: "UtensilsCrossed",
      category_icon_pack: "lucide",
      category_color: "#ef4444",
      amount: 62.3,
      currency: "EUR",
      date: d(0, 11, 20, 15, 0),
      note: "Friday date night",
      created_at: d(0, 11, 20, 20, 0),
      updated_at: d(0, 11, 20, 20, 0),
    },
    {
      id: "mock-tx-current-10",
      title: "Internet Bill",
      account_id: "mock-acc-joint",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-utilities",
      category_name: "Utilities",
      category_icon: "Lightbulb",
      category_icon_pack: "lucide",
      category_color: "#0ea5e9",
      amount: 54.9,
      currency: "EUR",
      date: d(0, 12, 10, 0, 0),
      note: "",
      created_at: d(0, 12, 10, 3, 0),
      updated_at: d(0, 12, 10, 3, 0),
    },
    {
      id: "mock-tx-current-11",
      title: "Home Supplies",
      account_id: "mock-acc-joint",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-household",
      category_name: "Household",
      category_icon: "Package",
      category_icon_pack: "lucide",
      category_color: "#f97316",
      amount: 58.7,
      currency: "EUR",
      date: d(0, 19, 16, 5, 0),
      note: "",
      created_at: d(0, 19, 16, 7, 0),
      updated_at: d(0, 19, 16, 7, 0),
    },

    // Current month (professional account)
    {
      id: "mock-tx-current-12",
      title: "Client Retainer",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "income",
      category_id: "mock-cat-client-income",
      category_name: "Client Income",
      category_icon: "BriefcaseBusiness",
      category_icon_pack: "lucide",
      category_color: "#14b8a6",
      amount: 2200,
      currency: "USD",
      date: d(0, 3, 9, 0, 0),
      note: "Monthly retainer",
      created_at: d(0, 3, 9, 5, 0),
      updated_at: d(0, 3, 9, 5, 0),
    },
    {
      id: "mock-tx-current-13",
      title: "Project Milestone Payment",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "income",
      category_id: "mock-cat-client-income",
      category_name: "Client Income",
      category_icon: "BriefcaseBusiness",
      category_icon_pack: "lucide",
      category_color: "#14b8a6",
      amount: 1450,
      currency: "USD",
      date: d(0, 14, 14, 10, 0),
      note: "",
      created_at: d(0, 14, 14, 15, 0),
      updated_at: d(0, 14, 14, 15, 0),
    },
    {
      id: "mock-tx-current-14",
      title: "Design Tool Subscription",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-business-tools",
      category_name: "Business Tools",
      category_icon: "Laptop",
      category_icon_pack: "lucide",
      category_color: "#a855f7",
      amount: 49,
      currency: "USD",
      date: d(0, 4, 8, 10, 0),
      note: "",
      created_at: d(0, 4, 8, 12, 0),
      updated_at: d(0, 4, 8, 12, 0),
    },
    {
      id: "mock-tx-current-15",
      title: "Cloud Hosting",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-business-tools",
      category_name: "Business Tools",
      category_icon: "Laptop",
      category_icon_pack: "lucide",
      category_color: "#a855f7",
      amount: 36,
      currency: "USD",
      date: d(0, 9, 9, 15, 0),
      note: "",
      created_at: d(0, 9, 9, 17, 0),
      updated_at: d(0, 9, 9, 17, 0),
    },
    {
      id: "mock-tx-current-16",
      title: "Train to Client Office",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-business-travel",
      category_name: "Business Travel",
      category_icon: "Plane",
      category_icon_pack: "lucide",
      category_color: "#06b6d4",
      amount: 22.5,
      currency: "USD",
      date: d(0, 18, 7, 50, 0),
      note: "",
      created_at: d(0, 18, 7, 53, 0),
      updated_at: d(0, 18, 7, 53, 0),
    },

    // Next month (planned/forecast-like upcoming transactions)
    {
      id: "mock-tx-next-1",
      title: "Monthly Salary",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "income",
      category_id: "mock-cat-salary",
      category_name: "Salary",
      category_icon: "Wallet",
      category_icon_pack: "lucide",
      category_color: "#10b981",
      amount: 3850,
      currency: "USD",
      date: d(1, 1, 8, 30, 0),
      note: "Expected payroll",
      created_at: d(0, 26, 11, 0, 0),
      updated_at: d(0, 26, 11, 0, 0),
    },
    {
      id: "mock-tx-next-2",
      title: "Rent Payment",
      account_id: "mock-acc-main",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-rent",
      category_name: "Rent",
      category_icon: "Home",
      category_icon_pack: "lucide",
      category_color: "#6366f1",
      amount: 1450,
      currency: "USD",
      date: d(1, 2, 9, 10, 0),
      note: "Expected charge",
      created_at: d(0, 26, 11, 5, 0),
      updated_at: d(0, 26, 11, 5, 0),
    },
    {
      id: "mock-tx-next-3",
      title: "Shared Groceries",
      account_id: "mock-acc-joint",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-food",
      category_name: "Food",
      category_icon: "UtensilsCrossed",
      category_icon_pack: "lucide",
      category_color: "#ef4444",
      amount: 138,
      currency: "EUR",
      date: d(1, 5, 17, 30, 0),
      note: "",
      created_at: d(0, 26, 11, 10, 0),
      updated_at: d(0, 26, 11, 10, 0),
    },
    {
      id: "mock-tx-next-4",
      title: "Client Retainer",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "income",
      category_id: "mock-cat-client-income",
      category_name: "Client Income",
      category_icon: "BriefcaseBusiness",
      category_icon_pack: "lucide",
      category_color: "#14b8a6",
      amount: 2200,
      currency: "USD",
      date: d(1, 3, 9, 0, 0),
      note: "Expected invoice payment",
      created_at: d(0, 26, 11, 15, 0),
      updated_at: d(0, 26, 11, 15, 0),
    },
    {
      id: "mock-tx-next-5",
      title: "Design Tool Subscription",
      account_id: "mock-acc-business",
      created_by: MOCK_USER_ID,
      type: "expense",
      category_id: "mock-cat-business-tools",
      category_name: "Business Tools",
      category_icon: "Laptop",
      category_icon_pack: "lucide",
      category_color: "#a855f7",
      amount: 49,
      currency: "USD",
      date: d(1, 4, 8, 10, 0),
      note: "",
      created_at: d(0, 26, 11, 20, 0),
      updated_at: d(0, 26, 11, 20, 0),
    },
  ];

  return { accounts, accountMembers, categories, transactions };
}

function getState(): MockState {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_MOCK_STATE_KEY]?: MockState;
  };

  if (!globalScope[GLOBAL_MOCK_STATE_KEY]) {
    globalScope[GLOBAL_MOCK_STATE_KEY] = createSeedState();
  }

  return globalScope[GLOBAL_MOCK_STATE_KEY];
}

function toDate(value: Date | string | undefined): Date {
  if (value instanceof Date) return value;
  return new Date(value ?? 0);
}

function isInSelectedMonth(
  dateValue: Date | string,
  selectedMonth?: string,
  selectedYear?: string,
): boolean {
  if (!selectedMonth || !selectedYear) return true;

  const month = Number(selectedMonth);
  const year = Number(selectedYear);
  if (!Number.isInteger(month) || !Number.isInteger(year)) return false;

  const date = toDate(dateValue);
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month;
}

function sortTransactionsByDateAsc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime(),
  );
}

function buildCategoryTotals(transactions: Transaction[]): CategoryTotal[] {
  const totalsByCategory = new Map<string, CategoryTotal>();

  for (const transaction of transactions) {
    const categoryName = transaction.category_name?.trim();
    if (!categoryName) continue;
    const categoryType = transaction.type;

    const categoryKey = `${categoryType}:${categoryName}`;
    const existing = totalsByCategory.get(categoryKey);

    if (existing) {
      existing.total += Number(transaction.amount);

      if (!existing.category_icon && transaction.category_icon) {
        existing.category_icon = transaction.category_icon;
      }
      if (!existing.category_icon_pack && transaction.category_icon_pack) {
        existing.category_icon_pack = transaction.category_icon_pack;
      }
      if (!existing.category_color && transaction.category_color) {
        existing.category_color = transaction.category_color;
      }
      continue;
    }

    totalsByCategory.set(categoryKey, {
      category: categoryName,
      type: categoryType,
      total: Number(transaction.amount),
      category_icon: transaction.category_icon,
      category_icon_pack: transaction.category_icon_pack,
      category_color: transaction.category_color,
    });
  }

  return Array.from(totalsByCategory.values()).sort((a, b) =>
    a.category.localeCompare(b.category),
  );
}

export function hasMockAccountAccess(
  accountId: string,
  userId: string,
): boolean {
  const state = getState();
  return state.accountMembers.some(
    (member) => member.account_id === accountId && member.user_id === userId,
  );
}

export function listMockAccountsForUser(
  userId: string,
): Array<Account & { id: string }> {
  const state = getState();
  const userAccountIds = new Set(
    state.accountMembers
      .filter((member) => member.user_id === userId)
      .map((member) => member.account_id),
  );

  return state.accounts.filter(
    (account): account is Account & { id: string } => {
      const accountId = account.id;
      return typeof accountId === "string" && userAccountIds.has(accountId);
    },
  );
}

export function getMockAccountById(accountId: string): Account | null {
  const state = getState();
  const account = state.accounts.find((item) => item.id === accountId);
  return account ?? null;
}

export function listMockCategoriesForUser(userId: string): Category[] {
  const state = getState();
  return [...state.categories]
    .filter((category) => category.user_id === userId)
    .sort(
      (a, b) => toDate(a.created_at).getTime() - toDate(b.created_at).getTime(),
    );
}

export function getMockCategoryByIdForUser(
  categoryId: string,
  userId: string,
): Category | null {
  const state = getState();
  const category =
    state.categories.find(
      (item) => item.id === categoryId && item.user_id === userId,
    ) ?? null;
  return category;
}

export function listMockTransactionsForAccount(params: {
  accountId: string;
  userId: string;
  selectedMonth?: string;
  selectedYear?: string;
}): Transaction[] {
  const { accountId, userId, selectedMonth, selectedYear } = params;
  const state = getState();

  return sortTransactionsByDateAsc(
    state.transactions.filter((transaction) => {
      if (transaction.account_id !== accountId) return false;
      if (transaction.created_by !== userId) return false;
      return isInSelectedMonth(transaction.date, selectedMonth, selectedYear);
    }),
  );
}

export function getMockMonthlySummaryForAccount(params: {
  accountId: string;
  userId: string;
  selectedMonth: string;
  selectedYear: string;
}): MonthlyCategorySummary {
  const transactions = listMockTransactionsForAccount(params);
  const categoryTotals = buildCategoryTotals(transactions);
  const totalIncome = transactions.reduce(
    (sum, transaction) =>
      transaction.type === "income" ? sum + Number(transaction.amount) : sum,
    0,
  );
  const totalSpending = transactions.reduce(
    (sum, transaction) =>
      transaction.type === "expense" ? sum + Number(transaction.amount) : sum,
    0,
  );

  return {
    categoryTotals,
    totalSpending,
    totalIncome,
    selectedMonth: params.selectedMonth,
    selectedYear: params.selectedYear,
  };
}

export function getMockDashboardAccountSummaries(params: {
  userId: string;
  selectedMonth: string;
  selectedYear: string;
}): DashboardAccountSummary[] {
  const accounts = listMockAccountsForUser(params.userId);

  return accounts.map((account) => {
    const transactionCount = listMockTransactionsForAccount({
      accountId: account.id,
      userId: params.userId,
    }).length;

    return {
      account,
      summary: getMockMonthlySummaryForAccount({
        accountId: account.id,
        userId: params.userId,
        selectedMonth: params.selectedMonth,
        selectedYear: params.selectedYear,
      }),
      transactionCount,
    };
  });
}

export function createMockAccountForUser(
  input: {
    name: string;
    type: "single" | "shared" | "professional";
    currency: string;
  },
  userId: string,
): { id: string } {
  const state = getState();
  const id = crypto.randomUUID();
  const nowIso = new Date().toISOString();

  state.accounts.push({
    id,
    name: input.name,
    type: input.type,
    currency: input.currency,
    created_at: nowIso,
    updated_at: nowIso,
    account_members: [{ user_id: userId }],
  });

  state.accountMembers.push({
    account_id: id,
    user_id: userId,
  });

  return { id };
}

export function createMockCategoryForUser(
  input: {
    name: string;
    color?: string | null;
    icon?: string | null;
    icon_pack?: string | null;
  },
  userId: string,
): { id: string } {
  const state = getState();
  const id = crypto.randomUUID();
  const now = new Date();

  state.categories.push({
    id,
    user_id: userId,
    name: input.name,
    color: input.color ?? "",
    icon: input.icon ?? undefined,
    icon_pack: input.icon_pack ?? undefined,
    created_at: now,
  });

  return { id };
}

export function createMockTransactionForUser(
  input: {
    title: string;
    type: "income" | "expense";
    currency: string;
    amount: number;
    note?: string;
    date: Date;
    account_id: string;
    category_id?: string | null;
    category_name?: string | null;
    category_icon?: string | null;
    category_icon_pack?: string | null;
    category_color?: string | null;
  },
  userId: string,
): { id: string } {
  const state = getState();
  const id = crypto.randomUUID();
  const now = new Date();

  state.transactions.push({
    id,
    title: input.title,
    type: input.type,
    currency: input.currency,
    amount: input.amount,
    note: input.note,
    date: input.date,
    account_id: input.account_id,
    created_by: userId,
    created_at: now,
    updated_at: now,
    category_id: input.category_id ?? undefined,
    category_name: input.category_name ?? "",
    category_icon: input.category_icon ?? undefined,
    category_icon_pack: input.category_icon_pack ?? undefined,
    category_color: input.category_color ?? undefined,
  });

  return { id };
}
