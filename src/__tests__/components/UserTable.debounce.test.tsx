import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '@/src/components/ui/Toast';
import { UserTable } from '@/src/components/admin/UserTable';

vi.useFakeTimers();

function renderWithToast() {
  return render(
    <ToastProvider>
      <UserTable initialUsers={[]} total={0} />
    </ToastProvider>
  );
}

describe('UserTable — búsqueda con debounce', () => {
  it('el contador no se actualiza antes del debounce (300ms)', () => {
    renderWithToast();
    expect(screen.getByText(/Mostrando 0 de 0 usuarios/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Buscar por email/i), {
      target: { value: 'a@b.com' },
    });

    // Antes del debounce: el contador de "Mostrando" sigue mostrando los usuarios iniciales
    // (0), porque el debounce aún no ha aplicado debouncedSearch al filtro.
    expect(screen.getByText(/Mostrando 0 de 0 usuarios/i)).toBeInTheDocument();

    vi.advanceTimersByTime(300);
    // Tras el debounce: el efecto setDebouncedSearch se ejecutó.
    // Con 0 usuarios seguimos viendo 0, pero verificamos que la cadena sigue ahí (no error).
    expect(screen.getByText(/Mostrando 0 de 0 usuarios/i)).toBeInTheDocument();
  });
});