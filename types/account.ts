export type AccountType = "single" | "shared";

export type Currency = "JPY" | "EUR" | "USD";

export interface Account {
  id?: string;
  name: string;
  type: "single" | "shared" | "professional";
  currency: string;
  created_at?: string;
  updated_at?: string | null;
  account_members: { user_id: string }[];
}
