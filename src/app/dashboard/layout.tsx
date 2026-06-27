import { ErrorBoundary } from '@/src/components/ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
