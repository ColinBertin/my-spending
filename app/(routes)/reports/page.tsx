import LedgerPreview from "@/components/LedgerPreview";
import {
  GENERAL_LEDGER_NAME,
  getLedgerPreview,
} from "../ledger/ledger-preview";

export const metadata = {
  title: "Reports",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ download?: string }>;
}) {
  const { download } = await searchParams;
  const preview = await getLedgerPreview(GENERAL_LEDGER_NAME);

  return (
    <LedgerPreview
      {...preview}
      backHref="/"
      backLabel="Dashboard"
      autoDownload={download === "1"}
    />
  );
}
