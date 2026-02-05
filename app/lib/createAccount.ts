import { Account } from "@/types/firestore";
import { createClient } from "@/utils/supabase/client";
import { createMockAccount, isMockEnabled } from "@/utils/mockData";

export async function createAccount({
  name,
  currency,
  type,
  members = [],
  userId,
}: Account & { userId: string }) {
  if (!name || !currency || !type) {
    throw new Error("Missing required fields: name, currency, or type.");
  }

  if (!["single", "shared"].includes(type)) {
    throw new Error('Invalid type. Must be "single" or "shared".');
  }

  if (type === "shared") {
    if (!Array.isArray(members) || members.length === 0 || members.length > 2) {
      throw new Error("Shared accounts must have 1–2 members.");
    }
  } else {
    members = [userId];
  }

  if (isMockEnabled()) {
    return createMockAccount({
      id: "",
      name,
      currency,
      type,
      members,
      createdAt: new Date(),
    });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      name,
      currency,
      type,
      members,
      createdAt: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id as string;
}
