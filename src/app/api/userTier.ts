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

// Lo dejo así para mejorarlo a futuro
export async function getAIEndpointByRole(role: UserRole): Promise<string> {
  switch (role) {
    case "normal":
      return "/api/ai/claude";
    default:
      return  "/api/ai/claude";
  }
}

// Exporto la función de a donde tiene que enviar la Request
export async function routeAIRequest(prompt: string, context?: null) {
  const role = await getUserRole();
  const endpoint = await getAIEndpointByRole(role);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, context }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.statusText}`);
  }

  return response.json();
}
