"use server";

import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export type UserRole = "normal";

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.from("user_roles").select("role").single();

  if (error) {
    console.error(error);
  }

  return data?.role as UserRole;
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
