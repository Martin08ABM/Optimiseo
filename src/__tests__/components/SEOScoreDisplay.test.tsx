import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SEOScoreDisplay from '@/src/components/SEOScoreDisplay';

const scores = {
  overall: 82,
  categories: { contenido: 80, legibilidad: 75, keywords: 90, estructura: 85, metaTags: 70 },
};

describe('SEOScoreDisplay — accesibilidad', () => {
  it('el svg del gauge tiene role="img" y un <title> descriptivo', () => {
    render(<SEOScoreDisplay scores={scores} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    const title = svg.querySelector('title');
    expect(title?.textContent).toMatch(/Puntuación SEO: 82 de 100/);
  });

  it('el contenedor anuncia el score a lectores de pantalla con aria-live="polite"', () => {
    const { container } = render(<SEOScoreDisplay scores={scores} />);
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
  });
});