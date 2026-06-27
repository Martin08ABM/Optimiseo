import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalysisProgress } from '@/src/components/AnalysisProgress';

describe('AnalysisProgress', () => {
  it('tiene role=status y aria-live para anunciar el estado', () => {
    render(<AnalysisProgress />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status.getAttribute('aria-label')).toMatch(/Analizando/i);
  });

  it('incluye un mensaje sr-only para lectores de pantalla', () => {
    render(<AnalysisProgress />);
    expect(screen.getByText(/El análisis está en curso/i)).toHaveClass('sr-only');
  });

  it('muestra un skeleton con la estructura esperada', () => {
    const { container } = render(<AnalysisProgress />);
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
    expect(screen.getByText(/Analizando tu contenido con IA/)).toBeInTheDocument();
  });
});
