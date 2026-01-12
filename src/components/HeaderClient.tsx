'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import MobileMenu from "./MobileMenu";

export default function HeaderClient() {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAvatarUrl(user?.user_metadata?.avatar_url || null);
      setLoading(false);
    }
    
    getUser();
  }, []);

  return (
    <header className="relative flex flex-row justify-between items-center border-2 border-black rounded-xl px-3 py-2 mx-auto mt-4 mb-4 bg-gray-400">
      <Link href="/"><Image src="/name.png" alt="Logo" width={100} height={100} className="w-24 md:w-40" /></Link>

      <p className="hidden md:block ml-4">|</p>

      <nav className="hidden md:flex flex-row ml-6 text-black text-lg font-sans">
        <ul className="flex flex-row gap-8">
          <li><Link href="/usecase">Casos de uso</Link></li>
          <li><Link href="/pricing">Precios</Link></li>
        </ul>
      </nav>

      <p className="hidden md:block ml-4 mr-4">|</p>

      {!loading && user ? (
        <Link href="/dashboard" className="hidden md:block">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <Image key={avatarUrl} src={avatarUrl} alt={user.email?.[0]?.toUpperCase() || 'Avatar'} width={40} height={20} className="rounded-full border-2 border-black max-w-8 max-h-8" unoptimized />
            ) : (
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                {user.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </Link>
      ) : !loading ? (
        <section className="hidden md:flex flex-row ml-6 text-black text-lg font-sans gap-8">
          <Link href="/auth/register">Regístrate</Link>
          <Link href="/auth/login">Iniciar sesión</Link>
        </section>
      ) : null}

      <MobileMenu isAuthenticated={!!user} />

      {!loading && user && (
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
