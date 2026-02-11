'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import MobileMenu from "./MobileMenu";
import type { User } from "@supabase/supabase-js";

export default function HeaderClient() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAvatarUrl(user?.user_metadata?.avatar_url || null);
      // setLoading(false);
    }
    
    getUser();
  }, []);

  return (
    <header className="relative flex flex-row justify-between items-center border-2 border-black rounded-xl px-3 py-2 mx-auto mt-4 mb-4 bg-gray-400">
      {/* Logo de la aplicación */}
      <Link href="/"><Image src="/name.png" alt="Logo" width={100} height={100} className="w-24 md:w-40" /></Link>

      {/* Separador visual - oculto en mobile */}
      <p className="hidden md:block ml-4">|</p>

      {/* Navegación principal - oculta en mobile */}
      <nav className="hidden md:flex flex-row ml-6 text-black text-lg font-sans">
        <ul className="flex flex-row gap-8">
          <li><Link href="/pricing">Precios</Link></li>
          {user && <li><Link href="/dashboard/history">Historial</Link></li>}
          {user && <li><Link href="/dashboard/history/compare">Comparar</Link></li>}
        </ul>
      </nav>

      {/* Separador visual - oculto en mobile */}
      <p className="hidden md:block ml-4 mr-4">|</p>

      {/* Sección de autenticación - Condicional según estado del usuario - oculta en mobile */}
      {user ? (
        // Usuario autenticado: mostrar avatar o inicial
        <Link href="/dashboard" className="hidden md:block">
          <div className="flex items-center gap-4">
              {avatarUrl ? (
                // Avatar del usuario si existe
                <Image key={avatarUrl} src={avatarUrl} alt={user.email?.[0]?.toUpperCase() || 'Avatar'} width={40} height={20} className="rounded-full border-2 border-black max-w-8 max-h-8" unoptimized />
              ) : (
                // Inicial del email si no hay avatar
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                  {user.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}
          </div>
        </Link>
      ) : (
        // Usuario no autenticado: mostrar botones de registro e inicio de sesión
        <section className="hidden md:flex flex-row ml-6 text-black text-lg font-sans gap-8">
          <Link href="/auth/register">Regístrate</Link>
          <Link href="/auth/login">Iniciar sesión</Link>
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
    </header>
  );
}
