import { ErrorBoundary } from '@/src/components/ErrorBoundary';

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
