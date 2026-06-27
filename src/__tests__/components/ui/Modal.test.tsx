import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/src/components/ui/Modal';

beforeEach(() => {
  vi.useRealTimers();
});

describe('Modal', () => {
  it('no renderiza nada cuando open es false', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open={false} onClose={onClose} title="Título">
        Contenido
      </Modal>
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('renderiza con role=dialog y aria-modal cuando open', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Confirmar">
        Cuerpo del diálogo
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Confirmar')).toHaveAttribute('id', 'modal-title');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('cierra al pulsar Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Confirmar">
        Cuerpo
      </Modal>
    );
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('cierra al hacer clic en el backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Confirmar">
        Cuerpo
      </Modal>
    );
    const backdrop = screen.getByRole('presentation');
    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('no cierra con backdrop cuando closeOnBackdrop es false', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Confirmar" closeOnBackdrop={false}>
        Cuerpo
      </Modal>
    );
    fireEvent.mouseDown(screen.getByRole('presentation'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('cierra con el botón de cerrar del header', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Confirmar">
        Cuerpo
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Cerrar diálogo'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('mantiene el foco dentro del diálogo al tabular desde el último focuable', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Confirmar" footer={<button>OK</button>}>
        <button>Acción 1</button>
      </Modal>
    );
    const ok = screen.getByText('OK');
    ok.focus();
    expect(document.activeElement).toBe(ok);
    fireEvent.keyDown(document.body, { key: 'Tab' });
    // Tras Tab desde el último focuable, el foco vuelve al primero (Cancelar)
    expect(document.activeElement).not.toBe(ok);
  });
});
