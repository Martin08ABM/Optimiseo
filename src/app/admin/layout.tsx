import { AdminGuard } from '@/src/components/admin/AdminGuard';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { AdminTabs } from '@/src/components/admin/AdminTabs';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <div className="-mt-4">
    <AdminGuard>
      <ErrorBoundary>
      <div className="min-h-screen bg-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Header />
        </div>

        {/* Admin Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <AdminTabs />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>

        <div className="mt-10">
          <Footer />
        </div>
      </div>
      </ErrorBoundary>
    </AdminGuard>
  </div>
  );
}