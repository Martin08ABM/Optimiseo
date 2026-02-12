'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isAuthenticated: boolean;
}

export default function MobileMenu({ isAuthenticated }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-black"
        aria-label="Menú"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-gray-400 border-2 border-black rounded-b-xl mx-4 p-4 z-50">
          <nav className="flex flex-col gap-4 text-black font-sans">
            <Link href="/usecase" onClick={() => setIsOpen(false)}>Casos de uso</Link>
            <Link href="/pricing" onClick={() => setIsOpen(false)}>Precios</Link>
            <Link href="/guia-html" onClick={() => setIsOpen(false)}>Guía HTML</Link>
            <hr className="border-black" />
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>Mi cuenta</Link>
                <Link href="/dashboard/history" onClick={() => setIsOpen(false)}>Historial</Link>
                <Link href="/dashboard/history/compare" onClick={() => setIsOpen(false)}>Comparar</Link>
              </>
            ) : (
              <>
                <Link href="/auth/register" onClick={() => setIsOpen(false)}>Regístrate</Link>
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>Iniciar sesión</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
