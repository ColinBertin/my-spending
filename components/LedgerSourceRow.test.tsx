import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LedgerSourceRow from "./LedgerSourceRow";

describe("LedgerSourceRow", () => {
  it("links to the encoded ledger preview when it has entries", () => {
    const html = renderToStaticMarkup(
      <LedgerSourceRow
        ledgerName="未払費用"
        label="未払費用 · Accrued expenses"
        entries={2}
        netTotal={-1200}
        markColor="#0E7C66"
      />,
    );

    expect(html).toContain(
      `href="/ledger-generator/${encodeURIComponent("未払費用")}"`,
    );
    expect(html).toContain("未払費用 · Accrued expenses");
    expect(html).toContain("2 ENTRIES");
    expect(html).toContain("1,200");
    expect(html).toContain("background-color:#0E7C66");
    expect(html).not.toContain('disabled=""');
  });

  it("renders a disabled button without entries", () => {
    const html = renderToStaticMarkup(
      <LedgerSourceRow ledgerName="売上高" entries={0} netTotal={0} />,
    );

    expect(html).toContain("0 ENTRIES");
    expect(html).not.toContain("NET");
    expect(html).not.toContain("href=");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>No entries<\/button>/);
  });

  it("uses the singular for a single entry", () => {
    const html = renderToStaticMarkup(
      <LedgerSourceRow ledgerName="売上高" entries={1} netTotal={500} />,
    );

    expect(html).toContain("1 ENTRY");
  });
});
