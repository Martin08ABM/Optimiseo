import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

function Boom({ throwit }: { throwit: boolean }) {
  if (throwit) throw new Error('kaboom');
  return <p>ok</p>;
}

describe('ErrorBoundary', () => {
  it('muestra fallback con botones Recargar y Contactar soporte al capturar un error', () => {
    vi.stubEnv('NODE_ENV', 'production');
    render(
      <ErrorBoundary>
        <Boom throwit />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recargar página/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contactar soporte/i })).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('en producción NO expone el componentStack ni los detalles técnicos', () => {
    vi.stubEnv('NODE_ENV', 'production');
    render(
      <ErrorBoundary>
        <Boom throwit />
      </ErrorBoundary>
    );
    expect(screen.queryByText(/Ver detalles técnicos/i)).not.toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('en desarrollo muestra los detalles técnicos', () => {
    vi.stubEnv('NODE_ENV', 'development');
    render(
      <ErrorBoundary>
        <Boom throwit />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Ver detalles técnicos/i)).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <Boom throwit={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});
