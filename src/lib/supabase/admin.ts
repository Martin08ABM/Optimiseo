import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase con Service Role para operaciones de admin.
 * Bypasses RLS - usar solo en contextos de servidor seguros (webhooks, cron jobs, etc.)
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
