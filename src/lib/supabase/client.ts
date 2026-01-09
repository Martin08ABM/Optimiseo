/**
 * Cliente de Supabase para el navegador
 * 
 * Este módulo crea y exporta una instancia del cliente de Supabase configurada
 * para ejecutarse en el navegador (client-side).
 * 
 * Utiliza las variables de entorno públicas de Next.js para la configuración:
 * - NEXT_PUBLIC_SUPABASE_URL: URL del proyecto de Supabase
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Clave anónima pública de Supabase
 * 
 * Este cliente debe usarse en componentes del cliente ('use client') para:
 * - Operaciones de autenticación en el navegador
 * - Consultas a la base de datos desde el cliente
 * - Subida de archivos desde el navegador
 * 
 * @module supabase/client
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Crea y retorna una instancia del cliente de Supabase para el navegador
 * 
 * @returns {SupabaseClient} Cliente de Supabase configurado para el navegador
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
