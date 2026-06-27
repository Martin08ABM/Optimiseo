import { ErrorBoundary } from '@/src/components/ErrorBoundary';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
