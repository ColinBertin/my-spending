"use client";

import { useEffect } from "react";

export default function PrintLedgerPdfButton({
  label = "Download PDF",
  documentTitle,
  autoStart = false,
}: {
  label?: string;
  documentTitle: string;
  autoStart?: boolean;
}) {
  const onClick = () => {
    const previousTitle = document.title;
    let restored = false;

    const restoreTitle = () => {
      if (restored) return;
      restored = true;
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    document.title = documentTitle;
    window.print();
    window.setTimeout(restoreTitle, 1000);
  };

  useEffect(() => {
    if (!autoStart) return;
    const timer = window.setTimeout(onClick, 50);
    return () => window.clearTimeout(timer);
  }, [autoStart]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="font-semibold py-2 px-4 rounded-3xl w-full transition-colors bg-blue-dark hover:bg-blue-light text-white cursor-pointer"
    >
      {label}
    </button>
  );
}
