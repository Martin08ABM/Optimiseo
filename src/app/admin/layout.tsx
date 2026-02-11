import { AdminGuard } from '@/src/components/admin/AdminGuard';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <div className="-mt-4">
    <AdminGuard>
      <div className="min-h-screen bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Header />
        </div>

        {/* Admin Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition"
            >
              Usuarios
            </Link>
            <Link
              href="/admin/discount-codes"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition"
            >
              Códigos de Descuento
            </Link>
          </nav>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <div className="mt-10">
          <Footer />
        </div>
      </div>
    </AdminGuard>
  </div>
  );
}