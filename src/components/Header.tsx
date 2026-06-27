import Image from "next/image";
import Link from "next/link";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { isAdminEmail } from "@/src/lib/admin/auth";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const avatarUrl = user?.user_metadata?.avatar_url;
  const isAdmin = user?.email ? isAdminEmail(user.email) : false;

  return (
    <header
      className="sticky top-4 z-50 flex flex-row justify-between items-center border border-gray-700 rounded-xl px-4 md:px-6 py-2.5 mx-auto mb-4 bg-gray-800/85 backdrop-blur-md shadow-lg w-[calc(100%-3rem)] max-w-[1200px]"
    >
      <div className="flex flex-row items-center gap-4 md:gap-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/name.png"
            alt="OptimiSEO — inicio"
            width={100}
            height={38}
            className="w-24 md:w-36 h-auto block"
          />
        </Link>
        <span className="hidden md:block font-light text-gray-600 text-lg" aria-hidden="true">|</span>
      </div>

      <nav
        className="hidden md:flex flex-row items-center text-gray-200 text-sm font-semibold tracking-wide"
        aria-label="Navegación principal"
      >
        <ul className="flex flex-row gap-5 lg:gap-7">
          <li><Link href="/pricing" className="hover:underline whitespace-nowrap">Precios</Link></li>
          <li><Link href="/guia-html" className="hover:underline whitespace-nowrap">Guía HTML</Link></li>
          {user && <li><Link href="/dashboard" className="hover:underline whitespace-nowrap">Mi cuenta</Link></li>}
          {user && <li><Link href="/dashboard/history" className="hover:underline whitespace-nowrap">Historial</Link></li>}
          {user && <li><Link href="/dashboard/history/compare" className="hover:underline whitespace-nowrap">Comparar</Link></li>}
          {user && <li><Link href="/dashboard/monitoring" className="hover:underline whitespace-nowrap">Monitorizar</Link></li>}
          {isAdmin && (
            <li>
              <Link href="/admin" className="text-red-400 font-bold hover:underline whitespace-nowrap">
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="flex flex-row items-center gap-4 md:gap-5">
        <span className="hidden md:block font-light text-gray-600 text-lg" aria-hidden="true">|</span>

        {user ? (
          <Link
            href="/dashboard"
            className="hidden md:block"
            aria-label={`Ir a tu cuenta: ${user.email ?? ''}`}
          >
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <Image
                  key={avatarUrl}
                  src={avatarUrl}
                  alt="Tu avatar"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-gray-600 w-9 h-9 object-cover block"
                  unoptimized
                />
              ) : (
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          </Link>
        ) : (
          <section className="hidden md:flex flex-row items-center gap-4 md:gap-5">
            <Link href="/auth/register" className="text-gray-200 font-bold text-sm hover:underline whitespace-nowrap">
              Regístrate
            </Link>
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white font-bold uppercase px-4 py-2 border border-blue-500 rounded-lg hover:bg-blue-700 transition-colors text-xs tracking-wider whitespace-nowrap"
            >
              ACCEDER
            </Link>
          </section>
        )}

        <MobileMenu isAuthenticated={!!user} />

        {user && (
          <Link href="/dashboard" className="md:hidden" aria-label="Ir a tu cuenta">
            {avatarUrl ? (
              <Image
                key={avatarUrl}
                src={avatarUrl}
                alt="Tu avatar"
                width={32}
                height={32}
                className="rounded-full border-2 border-gray-600 w-8 h-8"
                unoptimized
              />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
