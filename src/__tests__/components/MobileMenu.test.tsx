import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileMenu from '@/src/components/MobileMenu';

describe('MobileMenu', () => {
  it('no contiene el enlace muerto /usecase', () => {
    render(<MobileMenu isAuthenticated={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText(/Casos de uso/i)).not.toBeInTheDocument();
  });

  it('el botón tiene aria-expanded y aria-controls que reflejan el estado', () => {
    render(<MobileMenu isAuthenticated={false} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'mobile-menu');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById('mobile-menu');
    expect(panel).not.toBeNull();
    expect(panel!.querySelector('nav')).not.toBeNull();
  });

  it('muestra enlaces de cuenta cuando está autenticado', () => {
    render(<MobileMenu isAuthenticated={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Mi cuenta')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
  });
});
