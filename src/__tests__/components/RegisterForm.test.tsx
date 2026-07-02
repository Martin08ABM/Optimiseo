import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '@/src/components/ui/Toast';

const registerAction = vi.fn();
vi.mock('@/src/actions/auth/register', () => ({
  registerAction: (...args: unknown[]) => registerAction(...args),
}));

import RegisterForm from '@/src/components/auth/RegisterForm';

function renderForm() {
  return render(
    <ToastProvider>
      <RegisterForm />
    </ToastProvider>
  );
}

function getPasswordInput() {
  return screen.getByLabelText('Contraseña:') as HTMLInputElement;
}

beforeEach(() => registerAction.mockReset());

describe('RegisterForm — medidor de fortaleza y mostrar contraseña', () => {
  it('las 5 reglas son visibles inicialmente', () => {
    renderForm();
    expect(screen.getByText('Mínimo de 8 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Una letra minúscula')).toBeInTheDocument();
    expect(screen.getByText('Una letra mayúscula')).toBeInTheDocument();
    expect(screen.getByText('Un número')).toBeInTheDocument();
    expect(screen.getByText('Un símbolo especial')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrarme/i })).toBeDisabled();
  });

  it('marca todas las reglas cumplidas con una contraseña fuerte', () => {
    renderForm();
    fireEvent.change(getPasswordInput(), { target: { value: 'Ab1@aaaa' } });
    expect(screen.getByText('Contraseña válida')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrarme/i })).not.toBeDisabled();
  });

  it('no habilita el botón con una contraseña débil', () => {
    renderForm();
    fireEvent.change(getPasswordInput(), { target: { value: 'solo_minus' } });
    expect(screen.queryByText('Contraseña válida')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrarme/i })).toBeDisabled();
  });

  it('toggle "Mostrar" cambia el tipo del input entre password y text', () => {
    renderForm();
    const input = getPasswordInput();
    expect(input.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: /Mostrar contraseña/i }));
    expect(input.type).toBe('text');
    expect(screen.getByRole('button', { name: /Ocultar contraseña/i })).toHaveAttribute('aria-pressed', 'true');
  });
});