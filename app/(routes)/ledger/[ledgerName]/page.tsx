import LedgerPreview from "@/components/LedgerPreview";
import { getLedgerPreview } from "../ledger-preview";

export const metadata = {
  title: "Ledger Preview",
};

export default async function LedgerPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ ledgerName: string }>;
  searchParams: Promise<{ download?: string }>;
}) {
  const { ledgerName } = await params;
  const { download } = await searchParams;
  const preview = await getLedgerPreview(ledgerName);

  return (
    <LedgerPreview
      {...preview}
      backHref="/ledger"
      backLabel="Ledger generator"
      autoDownload={download === "1"}
    />
  );
}
