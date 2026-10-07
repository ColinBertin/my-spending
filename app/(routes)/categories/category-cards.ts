import { colorCodes } from "@/helpers";
import { Category } from "@/types";

export const FALLBACK_CATEGORY_HEX = "#5C5952";

export type CategoryScope = NonNullable<Category["type"]>;

export type CategoryUsageRow = {
  account_id: string | null;
  category_id: string | null;
  category_name: string | null;
  amount: number | string | null;
  currency: string | null;
};

export type CategoryCard = {
  id: string;
  name: string;
  scope: CategoryScope;
  hex: string;
  icon?: string;
  iconPack?: string;
  entries: number;
  usageLabel: string;
  total: string;
  barPercent: number;
};

export type CategoriesOverview = {
  cards: CategoryCard[];
  meta: string;
};

/** Categories store a `colorCodes` key (e.g. "rose"); resolve it to its hex. */
export function resolveCategoryHex(color?: string | null) {
  if (!color) {
    return FALLBACK_CATEGORY_HEX;
  }
  return colorCodes[color as keyof typeof colorCodes] ?? FALLBACK_CATEGORY_HEX;
}

/** Same 0.72 darkening the design uses so icon strokes read on a tinted tile. */
export function darkenHex(hex: string, factor = 0.72) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    return hex;
  }
  const channels = [0, 2, 4].map((offset) =>
    Math.round(parseInt(match[1].slice(offset, offset + 2), 16) * factor)
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${channels.join("")}`;
}

export function formatCurrencyAmount(amount: number, currency: string) {
  const code = currency.toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "JPY" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

type Usage = {
  entries: number;
  accountIds: Set<string>;
  totals: Map<string, number>;
};

export function buildCategoriesOverview(
  categories: Category[],
  rows: CategoryUsageRow[],
  accountNames: Map<string, string>,
): CategoriesOverview {
  const usageById = new Map<string, Usage>(
    categories.map((category) => [
      category.id,
      { entries: 0, accountIds: new Set(), totals: new Map() },
    ]),
  );
  const idByName = new Map<string, string>();
  for (const category of categories) {
    if (!idByName.has(category.name)) {
      idByName.set(category.name, category.id);
    }
  }

  const usedAccountIds = new Set<string>();

  for (const row of rows) {
    const categoryId =
      row.category_id && usageById.has(row.category_id)
        ? row.category_id
        : row.category_name
          ? idByName.get(row.category_name)
          : undefined;
    if (!categoryId) {
      continue;
    }

    const usage = usageById.get(categoryId)!;
    usage.entries += 1;
    if (row.account_id) {
      usage.accountIds.add(row.account_id);
      usedAccountIds.add(row.account_id);
    }
    const currency = (row.currency || "JPY").toUpperCase();
    const amount = Number(row.amount) || 0;
    usage.totals.set(currency, (usage.totals.get(currency) ?? 0) + amount);
  }

  const maxEntries = Math.max(
    0,
    ...Array.from(usageById.values(), (usage) => usage.entries),
  );

  const cards = categories.map((category): CategoryCard => {
    const usage = usageById.get(category.id)!;
    const accountIds = Array.from(usage.accountIds);

    let usageLabel = "NO ENTRIES YET";
    if (usage.entries > 0) {
      const scopeLabel =
        accountIds.length === 1
          ? (accountNames.get(accountIds[0]) ?? "1 ACCOUNT").toUpperCase()
          : `${accountIds.length} ACCOUNTS`;
      usageLabel = `${scopeLabel} · ${plural(usage.entries, "ENTRY", "ENTRIES")}`;
    }

    return {
      id: category.id,
      name: category.name,
      scope: category.type ?? "normal",
      hex: resolveCategoryHex(category.color),
      icon: category.icon || undefined,
      iconPack: category.icon_pack || undefined,
      entries: usage.entries,
      usageLabel,
      total:
        usage.totals.size > 0
          ? Array.from(usage.totals, ([currency, amount]) =>
              formatCurrencyAmount(amount, currency),
            ).join(" · ")
          : "—",
      barPercent: maxEntries > 0 ? (usage.entries / maxEntries) * 100 : 0,
    };
  });

  const meta = `${plural(categories.length, "category", "categories")} · used across ${plural(usedAccountIds.size, "account", "accounts")}`;

  return { cards, meta };
}
