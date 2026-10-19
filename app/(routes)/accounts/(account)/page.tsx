import { redirect } from "next/navigation";
import { getAccountsMonthlySummary } from "./data";

export const metadata = {
  title: "Accounts",
};

export default async function AccountsPage() {
  const [firstAccount] = await getAccountsMonthlySummary();

  if (!firstAccount) {
    redirect("/accounts/create");
  }

  redirect(`/accounts/${firstAccount.id}/details`);
}
