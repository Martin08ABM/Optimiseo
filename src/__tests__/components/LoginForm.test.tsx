import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/src/components/ui/Toast';

const loginAction = vi.fn();
vi.mock('@/src/actions/auth/login', () => ({
  loginAction: (...args: unknown[]) => loginAction(...args),
}));

import LoginForm from '@/src/components/auth/LoginForm';

function renderForm() {
  return render(
    <ToastProvider>
      <LoginForm />
    </ToastProvider>
  );
}

beforeEach(() => {
  loginAction.mockReset();
});

describe('LoginForm', () => {
  it('muestra el encabezado en color visible (text-white)', () => {
    renderForm();
    const heading = screen.getByRole('heading', { level: 1, name: /Inicio de Sesión/i });
    expect(heading.className).toContain('text-white');
  });

  it('incluye un enlace a recuperación de contraseña', () => {
    renderForm();
    const link = screen.getByRole('link', { name: /Olvidaste tu contraseña/i });
    expect(link).toHaveAttribute('href', '/auth/ResetPassword');
  });

  it('muestra un toast de error cuando loginAction falla', async () => {
    loginAction.mockResolvedValue({ error: 'Credenciales inválidas' });
    renderForm();

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'Secret1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(loginAction).toHaveBeenCalledOnce();
    });
    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  it('los inputs tienen anillo de foco visible (focus:ring)', () => {
    renderForm();
    const email = screen.getByLabelText(/Email/i);
    const password = screen.getByLabelText(/Contraseña/i);
    expect(email.className).toContain('focus:ring');
    expect(password.className).toContain('focus:ring');
  });
});
