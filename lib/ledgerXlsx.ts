import { Transaction } from "../types";
import * as XLSX from "xlsx";

const TEMPLATE_PATH = "/水道光熱費_2024.xlsx";
const FALLBACK_TEMPLATE_PATH = "/ledger-template.xlsx";
const MAX_COL = 5;
const HEADER_TITLES = [
  "日          付\n伝票No\n生成元",
  "相手勘定科目\n相手補助科目",
  "摘　　要",
  "補　助　科　目\n\n収　入　金　額",
  "支　出　金　額",
  "残　　高",
];

type CellTemplate = Pick<XLSX.CellObject, "s" | "z">;
type RowTemplate = CellTemplate[];
type StyleLike = Record<string, unknown>;
export type LedgerWorkbookOptions = {
  generalLedger?: boolean;
};

let templateBufferCache: ArrayBuffer | null = null;
let templateFetchAttempted = false;
const BORDER_COLOR = "000000";
const SUBTOTAL_FILL = "BFBFBF";
const SHEET_NAME = "Feuil1";

function deepCloneStyle(style: unknown): StyleLike {
  if (!style || typeof style !== "object") return {};
  return JSON.parse(JSON.stringify(style)) as StyleLike;
}

function withCellStyle(
  baseStyle: unknown,
  options: { isHeader?: boolean; isSummary?: boolean },
) {
  const style = deepCloneStyle(baseStyle);
  const alignment = (style.alignment as StyleLike | undefined) ?? {};

  style.alignment = {
    ...alignment,
    vertical: "center",
    wrapText: true,
    horizontal: options.isHeader ? "center" : (alignment.horizontal ?? "left"),
  };

  style.border = {
    top: { style: "thin", color: { rgb: BORDER_COLOR } },
    right: { style: "thin", color: { rgb: BORDER_COLOR } },
    bottom: { style: "thin", color: { rgb: BORDER_COLOR } },
    left: { style: "thin", color: { rgb: BORDER_COLOR } },
  };

  if (options.isSummary) {
    const fill = (style.fill as StyleLike | undefined) ?? {};
    style.fill = {
      ...fill,
      patternType: "solid",
      fgColor: { rgb: SUBTOTAL_FILL },
      bgColor: { rgb: SUBTOTAL_FILL },
    };
  }

  return style;
}

function buildFallbackTemplateWorkbook() {
  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};

  ws["!cols"] = [
    { wpx: 62, wch: 9.5 },
    { wpx: 130, wch: 20.83 },
    { wpx: 194, wch: 31.5 },
    { wpx: 129, wch: 20.67 },
    { wpx: 130, wch: 20.83 },
    { wpx: 130, wch: 20.83 },
  ];
  ws["!margins"] = {
    left: 0.7,
    right: 0.7,
    top: 1.25,
    bottom: 1.25,
    header: 0.25,
    footer: 0.3,
  };

  const rows: XLSX.RowInfo[] = [];
  for (let r = 0; r < 60; r++) rows[r] = { hpx: 48, hpt: 48 };
  rows[1] = { hpx: 16, hpt: 16 };
  ws["!rows"] = rows;

  const baseCell = (isHeader = false, isSummary = false): XLSX.CellObject => ({
    t: "z",
    s: withCellStyle(undefined, { isHeader, isSummary }),
  });

  for (let c = 0; c <= MAX_COL; c++) {
    ws[XLSX.utils.encode_cell({ r: 0, c })] = baseCell(true, false);
    ws[XLSX.utils.encode_cell({ r: 1, c })] = baseCell(false, false);
    ws[XLSX.utils.encode_cell({ r: 2, c })] = baseCell(false, false);
    ws[XLSX.utils.encode_cell({ r: 4, c })] = baseCell(false, true);
    ws[XLSX.utils.encode_cell({ r: 47, c })] = baseCell(false, true);
  }

  // Number formats on income/expense/balance columns for template rows.
  for (const r of [1, 2, 4, 47]) {
    for (const c of [3, 4, 5]) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr] as XLSX.CellObject;
      cell.z = "#,##0\\ _¥";
    }
  }
  ws[XLSX.utils.encode_cell({ r: 0, c: 0 })].z = "@";

  ws["!ref"] = "A1:F48";
  XLSX.utils.book_append_sheet(wb, ws, SHEET_NAME);
  return wb;
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function fmtMD(value: Date | string) {
  const d = toDate(value);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function dayKey(value: Date | string) {
  const d = toDate(value);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function monthKey(value: Date | string) {
  const d = toDate(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabelJP(value: Date | string) {
  const d = toDate(value);
  const m = d.getMonth() + 1;
  const fw = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
  const toFW = (n: number) =>
    String(n)
      .split("")
      .map((ch) => fw[Number(ch)])
      .join("");
  return `${toFW(m)}月度　合計`;
}

async function loadTemplateWorkbook() {
  if (!templateBufferCache && !templateFetchAttempted) {
    templateFetchAttempted = true;
    const candidates = [
      TEMPLATE_PATH,
      encodeURI(TEMPLATE_PATH),
      FALLBACK_TEMPLATE_PATH,
    ];

    for (const path of candidates) {
      try {
        const res = await fetch(path);
        if (!res.ok) continue;
        templateBufferCache = await res.arrayBuffer();
        break;
      } catch {
        // Try next path.
      }
    }
  }

  if (!templateBufferCache) {
    return buildFallbackTemplateWorkbook();
  }

  return XLSX.read(templateBufferCache.slice(0), {
    type: "array",
    cellStyles: true,
    cellNF: true,
  });
}

function extractRowTemplate(ws: XLSX.WorkSheet, row: number): RowTemplate {
  const template: RowTemplate = [];

  for (let c = 0; c <= MAX_COL; c++) {
    const addr = XLSX.utils.encode_cell({ r: row, c });
    const cell = ws[addr] as XLSX.CellObject | undefined;
    template.push({
      s: cell?.s,
      z: cell?.z,
    });
  }

  return template;
}

function setStyledCell(
  ws: XLSX.WorkSheet,
  row: number,
  col: number,
  rowTemplate: RowTemplate,
  value: string | number | boolean | Date | undefined,
  type: XLSX.ExcelDataType,
  options: { isHeader?: boolean; isSummary?: boolean } = {},
) {
  const base = rowTemplate[col];
  const cell: XLSX.CellObject = { t: "z" };

  cell.s = withCellStyle(base?.s, options);
  if (base?.z) cell.z = base.z;

  if (value === undefined || value === null || value === "") {
    cell.t = "z";
  } else {
    cell.t = type;
    cell.v = value;
  }

  ws[XLSX.utils.encode_cell({ r: row, c: col })] = cell;
}

function clearBodyRowsKeepingStyle(
  ws: XLSX.WorkSheet,
  fromRow: number,
  toRow: number,
) {
  for (let r = fromRow; r <= toRow; r++) {
    for (let c = 0; c <= MAX_COL; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const existing = ws[addr] as XLSX.CellObject | undefined;
      const cleared: XLSX.CellObject = {
        t: "z",
      };
      if (existing?.s) cleared.s = existing.s;
      if (existing?.z) cleared.z = existing.z;
      ws[addr] = cleared;
    }
  }
}

function ensureRowMeta(
  ws: XLSX.WorkSheet,
  row: number,
  templateRowMeta?: XLSX.RowInfo,
) {
  if (!templateRowMeta) return;
  const rows = ws["!rows"] ?? [];
  if (!rows[row]) {
    rows[row] = { ...templateRowMeta };
    ws["!rows"] = rows;
  }
}

function setRowHeight(ws: XLSX.WorkSheet, row: number, hpx: number) {
  const rows = ws["!rows"] ?? [];
  const next: XLSX.RowInfo = {
    ...(rows[row] ?? {}),
    hpx,
    hpt: hpx * 0.75,
  };
  rows[row] = next;
  ws["!rows"] = rows;
}

function rowHeightPx(row?: XLSX.RowInfo, fallback = 16) {
  if (!row) return fallback;
  if (typeof row.hpx === "number") return row.hpx;
  if (typeof row.hpt === "number") return row.hpt / 0.75;
  return fallback;
}

function escapeSheetNameForRef(sheetName: string) {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

function setPrintMetadata(
  wb: XLSX.WorkBook,
  sheetName: string,
  sheetIndex: number,
  lastRowZeroBased: number,
) {
  const workbook = (wb.Workbook ??= {});
  const names = (workbook.Names ??= []);
  const escapedSheet = escapeSheetNameForRef(sheetName);
  const printAreaRef = `${escapedSheet}!$A$1:$${XLSX.utils.encode_col(MAX_COL)}$${lastRowZeroBased + 1}`;
  const printTitlesRef = `${escapedSheet}!$1:$1`;

  const upsertDefinedName = (name: string, ref: string) => {
    const index = names.findIndex(
      (item) => item.Name === name && item.Sheet === sheetIndex,
    );

    if (index >= 0) {
      names[index] = {
        ...names[index],
        Name: name,
        Sheet: sheetIndex,
        Ref: ref,
      };
      return;
    }

    names.push({
      Name: name,
      Sheet: sheetIndex,
      Ref: ref,
    });
  };

  upsertDefinedName("_xlnm.Print_Area", printAreaRef);
  upsertDefinedName("_xlnm.Print_Titles", printTitlesRef);
}

export async function buildLedgerWorkbook(
  transactions: Transaction[],
  openingBalance = 0,
  options: LedgerWorkbookOptions = {},
) {
  const wb = await loadTemplateWorkbook();
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const templateRange = XLSX.utils.decode_range(ws["!ref"] ?? "A1:F1");
  const templateLastRow = templateRange.e.r;

  const rowTemplates = {
    header: extractRowTemplate(ws, 0),
    carry: extractRowTemplate(ws, 1),
    entry: extractRowTemplate(ws, 2),
    subtotal: extractRowTemplate(ws, 4),
    total: extractRowTemplate(ws, templateLastRow),
  };

  const rowMeta = ws["!rows"] ?? [];
  const rowMetaTemplates = {
    header: rowMeta[0],
    carry: rowMeta[1],
    entry: rowMeta[2],
    subtotal: rowMeta[4],
    total: rowMeta[templateLastRow],
  };

  clearBodyRowsKeepingStyle(ws, 1, templateLastRow);

  const txs = [...transactions].sort((a, b) => {
    const da = toDate(a.date).getTime();
    const db = toDate(b.date).getTime();
    if (da !== db) return da - db;
    return String(a.id).localeCompare(String(b.id));
  });

  let row = 1;
  let running = openingBalance;
  let monthIncome = 0;
  let monthExpense = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  let currentMonth: string | null = null;
  let previousDay: string | null = null;

  const writeHeaderRow = () => {
    ensureRowMeta(ws, 0, rowMetaTemplates.header);
    for (let c = 0; c <= MAX_COL; c++) {
      setStyledCell(ws, 0, c, rowTemplates.header, HEADER_TITLES[c], "s", {
        isHeader: true,
      });
    }
  };

  const writeCarryRow = () => {
    ensureRowMeta(ws, row, rowMetaTemplates.carry);
    setStyledCell(ws, row, 0, rowTemplates.carry, undefined, "s");
    setStyledCell(ws, row, 1, rowTemplates.carry, undefined, "s");
    setStyledCell(ws, row, 2, rowTemplates.carry, "前期より繰越", "s");
    setStyledCell(ws, row, 3, rowTemplates.carry, undefined, "n");
    setStyledCell(ws, row, 4, rowTemplates.carry, undefined, "n");
    setStyledCell(ws, row, 5, rowTemplates.carry, openingBalance, "n");
    row++;
  };

  const writeSubtotalRow = (dateForMonth: Date | string) => {
    ensureRowMeta(ws, row, rowMetaTemplates.subtotal);
    setRowHeight(ws, row, rowHeightPx(rowMetaTemplates.carry));
    setStyledCell(ws, row, 0, rowTemplates.subtotal, undefined, "s", {
      isSummary: true,
    });
    setStyledCell(ws, row, 1, rowTemplates.subtotal, undefined, "s", {
      isSummary: true,
    });
    setStyledCell(
      ws,
      row,
      2,
      rowTemplates.subtotal,
      monthLabelJP(dateForMonth),
      "s",
      { isSummary: true },
    );
    setStyledCell(ws, row, 3, rowTemplates.subtotal, monthIncome, "n", {
      isSummary: true,
    });
    setStyledCell(ws, row, 4, rowTemplates.subtotal, monthExpense, "n", {
      isSummary: true,
    });
    setStyledCell(ws, row, 5, rowTemplates.subtotal, undefined, "n", {
      isSummary: true,
    });
    row++;
  };

  const writeGeneralLedgerFooterRow = (
    label: string,
    income: number | undefined,
    expense: number | undefined,
    balance: number | undefined,
  ) => {
    ensureRowMeta(ws, row, rowMetaTemplates.total);
    setRowHeight(ws, row, rowHeightPx(rowMetaTemplates.carry));
    setStyledCell(ws, row, 0, rowTemplates.total, undefined, "s", {
      isSummary: true,
    });
    setStyledCell(ws, row, 1, rowTemplates.total, undefined, "s", {
      isSummary: true,
    });
    setStyledCell(ws, row, 2, rowTemplates.total, label, "s", {
      isSummary: true,
    });
    setStyledCell(ws, row, 3, rowTemplates.total, income, "n", {
      isSummary: true,
    });
    setStyledCell(ws, row, 4, rowTemplates.total, expense, "n", {
      isSummary: true,
    });
    setStyledCell(ws, row, 5, rowTemplates.total, balance, "n", {
      isSummary: true,
    });
    row++;
  };

  const writeEntryRow = (
    tx: Transaction,
    voucherNo: number,
    income: number,
    expense: number,
    showDate: boolean,
  ) => {
    ensureRowMeta(ws, row, rowMetaTemplates.entry);
    const left = `${showDate ? fmtMD(tx.date) : ""}\n${voucherNo}`;
    const description = tx.note?.trim()
      ? `${tx.title} / ${tx.note.trim()}`
      : tx.title;
    const accountLabel = options.generalLedger
      ? tx.category_name || "未分類"
      : "現金";

    setStyledCell(ws, row, 0, rowTemplates.entry, left, "s");
    setStyledCell(ws, row, 1, rowTemplates.entry, accountLabel, "s");
    setStyledCell(ws, row, 2, rowTemplates.entry, description, "s");
    setStyledCell(ws, row, 3, rowTemplates.entry, income || undefined, "n");
    setStyledCell(ws, row, 4, rowTemplates.entry, expense || undefined, "n");
    setStyledCell(ws, row, 5, rowTemplates.entry, running, "n");
    row++;
  };

  const writeClosingEntryRow = (
    voucherNo: number,
    income: number,
    expense: number,
  ) => {
    ensureRowMeta(ws, row, rowMetaTemplates.entry);
    const accountLabel = income > 0 ? "事業主借" : "事業主貸";

    setStyledCell(ws, row, 0, rowTemplates.entry, `12/31\n${voucherNo}`, "s");
    setStyledCell(ws, row, 1, rowTemplates.entry, accountLabel, "s");
    setStyledCell(ws, row, 2, rowTemplates.entry, undefined, "s");
    setStyledCell(ws, row, 3, rowTemplates.entry, income || undefined, "n");
    setStyledCell(ws, row, 4, rowTemplates.entry, expense || undefined, "n");
    setStyledCell(ws, row, 5, rowTemplates.entry, running, "n");
    row++;
  };

  writeHeaderRow();
  writeCarryRow();

  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    const mk = monthKey(tx.date);
    const day = dayKey(tx.date);

    if (currentMonth && currentMonth !== mk) {
      writeSubtotalRow(txs[i - 1].date);
      monthIncome = 0;
      monthExpense = 0;
      previousDay = null;
    }
    currentMonth = mk;

    const amount = Number(tx.amount) || 0;
    const income = tx.type === "income" ? amount : 0;
    const expense = tx.type === "expense" ? amount : 0;

    monthIncome += income;
    monthExpense += expense;
    totalIncome += income;
    totalExpense += expense;

    running = running + income - expense;

    writeEntryRow(tx, i + 1, income, expense, previousDay !== day);
    previousDay = day;
  }

  if (txs.length > 0) {
    writeSubtotalRow(txs[txs.length - 1].date);
  }

  if (options.generalLedger) {
    const periodNet = totalIncome - totalExpense;
    const closingIncome = periodNet < 0 ? Math.abs(periodNet) : 0;
    const closingExpense = periodNet > 0 ? periodNet : 0;

    if (txs.length > 0 && periodNet !== 0) {
      running = openingBalance;
      writeClosingEntryRow(txs.length + 1, closingIncome, closingExpense);
    }

    writeGeneralLedgerFooterRow(
      "決算仕訳　合計",
      closingIncome,
      closingExpense,
      undefined,
    );
    writeGeneralLedgerFooterRow(
      "当期累計",
      totalIncome + closingIncome,
      totalExpense + closingExpense,
      undefined,
    );
    writeGeneralLedgerFooterRow(
      "翌期へ繰越",
      undefined,
      undefined,
      openingBalance,
    );
  } else {
    writeGeneralLedgerFooterRow(
      "当期累計",
      totalIncome,
      totalExpense,
      openingBalance + (totalIncome - totalExpense),
    );
  }

  const finalLastRow = Math.max(templateLastRow, row - 1);
  ws["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: finalLastRow, c: MAX_COL },
  });
  const sheetIndex = wb.SheetNames.findIndex((name) => name === sheetName);
  setPrintMetadata(
    wb,
    sheetName,
    sheetIndex >= 0 ? sheetIndex : 0,
    finalLastRow,
  );

  return wb;
}
