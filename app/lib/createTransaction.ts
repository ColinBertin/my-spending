import { Transaction } from "@/types/firestore";
import { createClient } from "@/utils/supabase/client";
import { createMockTransaction, isMockEnabled } from "@/utils/mockData";

export async function createTransaction({
  title,
  type,
  currency,
  amount,
  note,
  date,
  userId,
  accountId,
  categoryId,
  categoryName,
  categoryIcon,
  categoryIconPack,
  categoryColor,
}: Transaction & { userId: string }) {
  if (
    !title ||
    !type ||
    !currency ||
    !amount ||
    !date ||
    !accountId ||
    !userId ||
    !categoryId ||
    !categoryName ||
    !categoryIconPack ||
    !categoryColor
  ) {
    throw new Error(
      "Missing required fields: title, type, currency, amount, date, accountId, userId, categoryId, categoryName, categoryColor, or categoryIconPack.",
    );
  }

  if (!["expense", "income"].includes(type)) {
    throw new Error('Invalid type. Must be "expense" or "income".');
  }

  if (isMockEnabled()) {
    return createMockTransaction({
      id: "",
      title,
      type,
      currency,
      amount: parseInt(amount as unknown as string, 10),
      note,
      date,
      accountId,
      createdBy: userId,
      createdAt: new Date(),
      categoryId,
      categoryName,
      categoryIcon,
      categoryIconPack,
      categoryColor,
    });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      categoryId,
      categoryName,
      title,
      type,
      currency,
      amount: parseInt(amount as unknown as string, 10),
      note,
      date: date instanceof Date ? date.toISOString() : date,
      accountId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      categoryIcon,
      categoryIconPack,
      categoryColor,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id as string;
}
