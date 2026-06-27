import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/src/components/ui/Toast';

const mockFetch = vi.fn();
beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

function renderMonitoring() {
  return render(
    <ToastProvider>
      <MonitoringClient />
    </ToastProvider>
  );
}

import MonitoringClient from '@/src/components/dashboard/MonitoringClient';

const URLS = [
  { id: 'u1', url: 'https://a.com', frequency: 'weekly', last_checked: null, last_score: 50, is_active: true, created_at: '2026-01-01' },
];

describe('MonitoringClient — manejo de errores', () => {
  it('muestra error con reintentar cuando falla la carga inicial', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fallo de red'));
    renderMonitoring();

    const alert = await waitFor(() => screen.getByRole('alert'));
    expect(alert.textContent).toMatch(/fallo de red|Error al cargar/i);
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('revertir optimistic UI y mostrar toast cuando delete falla', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ urls: URLS }) });
    mockFetch.mockRejectedValueOnce(new Error('fallo al eliminar'));
    renderMonitoring();

    await waitFor(() => expect(screen.getByText('https://a.com')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/Eliminar monitorización de https:\/\/a\.com/i));

    // El URL vuelve a aparecer tras revertir el optimistic UI
    await waitFor(() => expect(screen.getByText('https://a.com')).toBeInTheDocument());
    // Y se muestra el error al usuario (toast con role=status)
    await waitFor(() => {
      const toasts = screen.getAllByRole('status');
      expect(toasts.some((t) => /fallo al eliminar|Error al eliminar/i.test(t.textContent ?? ''))).toBe(true);
    });
  });

  it('toggle activo revierte y muestra toast cuando falla', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ urls: URLS }) });
    mockFetch.mockRejectedValueOnce(new Error('fallo al actualizar'));
    renderMonitoring();

    await waitFor(() => expect(screen.getByText('https://a.com')).toBeInTheDocument());
    const toggle = screen.getByRole('button', { name: 'Activo' });
    fireEvent.click(toggle);

    // El botón vuelve a su estado original (Activo) tras revertir el optimistic UI
    await waitFor(() => expect(screen.getByRole('button', { name: 'Activo' })).toBeInTheDocument());
    await waitFor(() => {
      const toasts = screen.getAllByRole('status');
      expect(toasts.some((t) => /fallo al actualizar|Error al actualizar/i.test(t.textContent ?? ''))).toBe(true);
    });
  });
});
