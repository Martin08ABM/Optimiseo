import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/src/components/ui/Toast';

function Trigger() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Guardado OK')}>success</button>
      <button onClick={() => toast.error('Algo falló')}>error</button>
      <button onClick={() => toast.info('Hola')}>info</button>
    </div>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ToastProvider', () => {
  it('muestra una notificación success con role=status y aria-live', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('success'));
    expect(screen.getByText('Guardado OK')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Notificaciones' })).toHaveAttribute('aria-live', 'polite');
  });

  it('ofrece un texto alternativo sr-only con el tipo de notificación', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('error'));
    expect(screen.getByText('Error')).toHaveClass('sr-only');
  });

  it('auto-descarta tras la duración indicada', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('success'));
    expect(screen.getByText('Guardado OK')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Guardado OK')).not.toBeInTheDocument();
  });

  it('se puede descartar manualmente con el botón de cerrar', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('info'));
    fireEvent.click(screen.getByLabelText('Cerrar notificación'));
    expect(screen.queryByText('Hola')).not.toBeInTheDocument();
  });

  it('lanza error si se usa useToast fuera del provider', () => {
    function Orphan() {
      useToast();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow('ToastProvider');
  });
});
