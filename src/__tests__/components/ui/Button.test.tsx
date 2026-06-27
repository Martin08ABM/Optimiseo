import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/src/components/ui/Button';

describe('Button', () => {
  it('aplica las clases de la variante primaria por defecto', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button', { name: 'Click' });
    expect(btn.className).toContain('bg-blue-600');
    expect(btn.className).toContain('focus:ring');
  });

  it('variant danger aplica bg-red-600', () => {
    render(<Button variant="danger">Borrar</Button>);
    expect(screen.getByRole('button').className).toContain('bg-red-600');
  });

  it('loading deshabilita el botón y muestra spinner', () => {
    render(<Button loading>Guardar</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('.animate-spin')).not.toBeNull();
  });

  it('disabled no dispara onClick', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>X</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('fullWidth añade w-full', () => {
    render(<Button fullWidth>Ancho</Button>);
    expect(screen.getByRole('button').className).toContain('w-full');
  });
});
