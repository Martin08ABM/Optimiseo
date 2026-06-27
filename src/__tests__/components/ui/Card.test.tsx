import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card } from '@/src/components/ui/Card';

describe('Card', () => {
  it('usa estilo base oscuro por defecto', () => {
    const { container } = render(<Card>contenido</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-gray-800');
    expect(card.className).toContain('border-gray-700');
    expect(card.textContent).toBe('contenido');
  });

  it('highlighted usa estilo azul', () => {
    const { container } = render(<Card highlighted>pro</Card>);
    expect((container.firstChild as HTMLElement).className).toContain('bg-blue-600/10');
  });
});
