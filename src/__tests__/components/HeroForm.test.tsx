import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroForm } from '@/src/components/Hero/HeroForm';

function getSubmit() {
  return screen.getByRole('button', { name: /Iniciar Análisis/i });
}

describe('HeroForm — validación de URL y labels', () => {
  it('rechaza una URL sin protocolo http/https', () => {
    const onSubmit = vi.fn();
    render(<HeroForm onSubmit={onSubmit} disabled={false} />);
    fireEvent.change(screen.getByLabelText(/URL de tu sitio web/i), { target: { value: 'ftp://x.com' } });
    fireEvent.click(getSubmit());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/http:\/\/ o https:\/\//i)).toBeInTheDocument();
  });

  it('los labels están asociados con htmlFor a sus inputs', () => {
    render(<HeroForm onSubmit={vi.fn()} disabled={false} />);
    const urlLabel = screen.getByText(/URL de tu sitio web/i).closest('label');
    expect(urlLabel).toHaveAttribute('for');
    expect(document.getElementById(urlLabel!.getAttribute('for')!)).not.toBeNull();
  });

  it('los inputs usan validación nativa type="url" + required como primera barrera', () => {
    render(<HeroForm onSubmit={vi.fn()} disabled={false} />);
    const urlInput = screen.getByLabelText(/URL de tu sitio web/i);
    expect(urlInput).toHaveAttribute('type', 'url');
    expect(urlInput).toBeRequired();
  });

  it('acepta una URL https válida y llama a onSubmit', () => {
    const onSubmit = vi.fn();
    render(<HeroForm onSubmit={onSubmit} disabled={false} />);
    fireEvent.change(screen.getByLabelText(/URL de tu sitio web/i), { target: { value: 'https://example.com/articulo' } });
    fireEvent.click(getSubmit());
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].url).toBe('https://example.com/articulo');
  });

  it('los labels están asociados con htmlFor a sus inputs', () => {
    render(<HeroForm onSubmit={vi.fn()} disabled={false} />);
    const urlLabel = screen.getByText(/URL de tu sitio web/i).closest('label');
    expect(urlLabel).toHaveAttribute('for');
    expect(document.getElementById(urlLabel!.getAttribute('for')!)).not.toBeNull();
  });
});