import { Category } from "@/types/firestore";
import { createClient } from "@/utils/supabase/client";
import { createMockCategory, isMockEnabled } from "@/utils/mockData";

export async function createCategory({
  name,
  color,
  userId,
  icon,
  iconPack,
}: Category & { userId: string }) {
  if (!name || !color || !icon || !iconPack) {
    throw new Error("Missing required fields: name, color, icon, or iconPack.");
  }

  if (isMockEnabled()) {
    return createMockCategory({
      id: "",
      name,
      color,
      icon,
      iconPack,
      userId,
      createdAt: new Date(),
    });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      color,
      icon,
      iconPack,
      userId,
      createdAt: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id as string;
}
