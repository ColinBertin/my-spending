"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// The browser uses document.title as the default PDF file name, so swap it in
// for the print and restore it afterwards.
function printWithTitle(documentTitle: string) {
  const previousTitle = document.title;
  let restored = false;

  const restoreTitle = () => {
    if (restored) {
      return;
    }
    restored = true;
    document.title = previousTitle;
    window.removeEventListener("afterprint", restoreTitle);
  };

  window.addEventListener("afterprint", restoreTitle);
  document.title = documentTitle;
  window.print();
  window.setTimeout(restoreTitle, 1000);
}

export default function PrintLedgerPdfButton({
  label = "Print PDF",
  documentTitle,
  autoStart = false,
}: {
  label?: string;
  documentTitle: string;
  autoStart?: boolean;
}) {
  useEffect(() => {
    if (!autoStart) {
      return;
    }
    const timer = window.setTimeout(() => printWithTitle(documentTitle), 50);
    return () => window.clearTimeout(timer);
  }, [autoStart, documentTitle]);

  return (
    <Button
      type="button"
      onClick={() => printWithTitle(documentTitle)}
      className="h-[42px] rounded-[9px] px-[15px] text-[13px] md:h-[38px]"
    >
      {label}
    </Button>
  );
}
