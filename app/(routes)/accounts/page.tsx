import { redirect } from "next/navigation";
import { getAccountsMonthlySummary } from "./data";

// No account selected: land on the first one.
export default async function AccountsPage() {
  const [firstAccount] = await getAccountsMonthlySummary();

  if (firstAccount) {
    redirect(`/accounts/${firstAccount.id}`);
  }

  return null;
}
