import { redirect } from 'next/navigation';
import { checkIsAdmin } from '@/src/lib/admin/auth';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Server component que protege rutas admin
 * Redirige a home si no es admin
 */
export async function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin } = await checkIsAdmin();

  if (!isAdmin) {
    redirect('/');
  }

  return <>{children}</>;
}