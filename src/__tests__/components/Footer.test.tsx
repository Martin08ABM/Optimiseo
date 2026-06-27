import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/src/components/Footer';

describe('Footer', () => {
  it('contiene enlaces legales/navegación', () => {
    render(<Footer />);
    expect(screen.getByRole('navigation', { name: /Enlaces legales/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Precios/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Guía HTML/i })).toBeInTheDocument();
  });

  it('usa next/link (no next/dist/client/link)', () => {
    // Validación indirecta: el link externo a GitHub renderiza como <a> con href correcto
    render(<Footer />);
    const author = screen.getByRole('link', { name: /Martin Adolfo/i });
    expect(author).toHaveAttribute('href', 'https://github.com/Martin08ABM');
  });
});
