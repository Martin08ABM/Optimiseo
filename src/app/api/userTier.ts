"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export type UserRole = "normal" | "free" | "pro";

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return "free";

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user subscription/role:", error);
  }

  return (data?.plan_id || "free") as UserRole;
}
