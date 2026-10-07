import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrencyIntoYen } from "@/helpers";

type LedgerSourceRowProps = {
  ledgerName: string;
  label?: string;
  entries: number;
  netTotal: number;
  markColor?: string;
};

export default function LedgerSourceRow({
  ledgerName,
  label = ledgerName,
  entries,
  netTotal,
  markColor,
}: LedgerSourceRowProps) {
  const hasEntries = entries > 0;

  return (
    <div className="flex items-center gap-[10px] py-[10px]">
      {markColor && (
        <span
          aria-hidden
          className="h-2 w-2 flex-none rounded-[2px]"
          style={{ backgroundColor: markColor }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] leading-[1.3] font-medium">
          {label}
        </p>
        <p className="mt-1 font-mono text-[10px] leading-none text-[#5C5952] tabular-nums">
          {entries} {entries === 1 ? "ENTRY" : "ENTRIES"}
          {hasEntries && ` · NET ${formatCurrencyIntoYen(netTotal)}`}
        </p>
      </div>
      {hasEntries ? (
        <Button
          asChild
          variant="outline"
          className="h-8 flex-none rounded-[8px] px-3 text-[12px]"
        >
          <Link
            href={`/ledger/${encodeURIComponent(ledgerName)}`}
            aria-label={`Preview ${label}`}
          >
            Preview
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled
          className="h-8 flex-none rounded-[8px] px-3 text-[12px]"
        >
          No entries
        </Button>
      )}
    </div>
  );
}
