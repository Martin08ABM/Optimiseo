'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/users', label: 'Usuarios', exact: false },
  { href: '/admin/discount-codes', label: 'Códigos de Descuento', exact: false },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones de administración" className="flex space-x-1 bg-gray-800 rounded-lg p-1">
      {TABS.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
