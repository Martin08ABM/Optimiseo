import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Cliente de Supabase con Service Role para operaciones de admin.
 * Bypasses RLS - usar solo en contextos de servidor seguros (webhooks, cron jobs, etc.)
 * Inicialización lazy para evitar errores en build time.
 */
export function createAdminClient(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}
