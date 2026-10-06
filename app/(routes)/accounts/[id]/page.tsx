import { notFound } from "next/navigation";
import StatTile from "@/components/StatTile";
import { formatCurrencyIntoYen } from "@/helpers";
import { getAccountsMonthlySummary } from "../data";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accounts = await getAccountsMonthlySummary();
  const account = accounts.find((a) => a.id === id);

  // 404 rather than 403 so account ids can't be probed.
  if (!account) {
    notFound();
  }

  const statTiles = [
    { label: "Income", value: formatCurrencyIntoYen(account.income) },
    { label: "Spending", value: formatCurrencyIntoYen(account.spending) },
    { label: "Balance", value: formatCurrencyIntoYen(account.balance) },
    { label: "Entries", value: account.entryCount },
  ];

  return (
    <section className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-[#E3DFD7] sm:grid-cols-4">
      {statTiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </section>
  );
}
