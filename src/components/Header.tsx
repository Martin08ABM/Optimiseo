/**
 * Componente Header - Barra de navegación principal
 *
 * Este componente muestra la barra de navegación superior de la aplicación.
 * Incluye:
 * - Logo de la aplicación
 * - Enlaces de navegación (Precios) - ocultos en mobile
 * - Autenticación condicional:
 *   - Si el usuario está autenticado: muestra su avatar o inicial
 *   - Si no está autenticado: muestra botones de registro e inicio de sesión
 * - Menú hamburguesa para dispositivos móviles
 *
 * El componente es asíncrono porque consulta el estado de autenticación del usuario
 * desde Supabase en el servidor.
 *
 * @component
 * @returns {Promise<JSX.Element>} Header con navegación, menú móvil y estado de autenticación
 */

import Image from "next/image";
import Link from "next/link";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { isAdminEmail } from "@/src/lib/admin/auth";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  // Obtener cliente de Supabase del servidor
  const supabase = await createServerSupabaseClient();

  // Obtener datos del usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();

  // Extraer URL del avatar del metadata del usuario
  const avatarUrl = user?.user_metadata?.avatar_url;

  // Verificar si el usuario es admin
  const isAdmin = user?.email ? isAdminEmail(user.email) : false;

  return (
    <header className="sticky top-4 z-50 flex flex-row justify-between items-center border-2 border-black rounded-xl px-4 md:px-6 py-2.5 mx-auto mb-4 bg-gray-400/85 backdrop-blur-md shadow-[4px_4px_0px_#000000] w-[calc(100%-3rem)] max-w-[1200px] select-none" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Grupo Izquierdo: Logo + Separador */}
      <div className="flex flex-row items-center gap-4 md:gap-5">
        <Link href="/" className="flex items-center">
          <Image src="/name.png" alt="Logo" width={100} height={38} className="w-24 md:w-36 h-auto block" />
        </Link>

        {/* Separador visual - oculto en mobile */}
        <span className="hidden md:block font-light text-black/30 text-lg">|</span>
      </div>

      {/* Navegación principal - oculta en mobile */}
      <nav className="hidden md:flex flex-row items-center text-black text-sm font-semibold tracking-wide">
        <ul className="flex flex-row gap-5 lg:gap-7">
          <li><Link href="/pricing" className="hover:underline whitespace-nowrap">Precios</Link></li>
          <li><Link href="/guia-html" className="hover:underline whitespace-nowrap">Guía HTML</Link></li>
          {user && <li><Link href="/dashboard/history" className="hover:underline whitespace-nowrap">Historial</Link></li>}
          {user && <li><Link href="/dashboard/history/compare" className="hover:underline whitespace-nowrap">Comparar</Link></li>}
          {user && <li><Link href="/dashboard/monitoring" className="hover:underline whitespace-nowrap">Monitorizar</Link></li>}
          {isAdmin && (
            <li>
              <Link href="/admin" className="text-red-600 font-bold hover:underline whitespace-nowrap">
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Grupo Derecho: Separador + Auth / Menú Móvil */}
      <div className="flex flex-row items-center gap-4 md:gap-5">
        {/* Separador visual - oculto en mobile */}
        <span className="hidden md:block font-light text-black/30 text-lg">|</span>

        {/* Sección de autenticación - Condicional según estado del usuario - oculta en mobile */}
        {user ? (
          // Usuario autenticado: mostrar avatar o inicial
          <Link href="/dashboard" className="hidden md:block">
            <div className="flex items-center gap-4">
                {avatarUrl ? (
                  // Avatar del usuario si existe
                  <Image key={avatarUrl} src={avatarUrl} alt={user.email?.[0]?.toUpperCase() || 'Avatar'} width={36} height={36} className="rounded-full border-2 border-black w-9 h-9 object-cover block" unoptimized />
                ) : (
                  // Inicial del email si no hay avatar
                  <div className="w-9 h-9 bg-black border-2 border-black rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[1px_1px_0px_#000]">
                    {user.email?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
            </div>
          </Link>
        ) : (
          // Usuario no autenticado: mostrar botones de registro e inicio de sesión
          <section className="hidden md:flex flex-row items-center gap-4 md:gap-5">
            <Link href="/auth/register" className="text-black font-bold text-sm hover:underline whitespace-nowrap">
              Regístrate
            </Link>
            <Link href="/auth/login" className="bg-[#2563eb] text-white font-bold uppercase px-4 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[1px_1px_0px_#000] transition-all text-xs tracking-wider whitespace-nowrap">
              ACCEDER
            </Link>
          </section>
        )}

        {/* Menú móvil */}
        <MobileMenu isAuthenticated={!!user} />

        {/* Avatar en mobile - solo si está autenticado */}
        {user && (
          <Link href="/dashboard" className="md:hidden">
            {avatarUrl ? (
              <Image key={avatarUrl} src={avatarUrl} alt="Avatar" width={32} height={32} className="rounded-full border-2 border-black w-8 h-8" unoptimized />
            ) : (
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}