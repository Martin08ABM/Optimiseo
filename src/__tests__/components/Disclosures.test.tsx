import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import Showcase from '@/src/components/landing/Showcase';
import RewritePanel from '@/src/components/RewritePanel';

vi.mock('@/src/components/RewriteButton', () => ({
  default: () => <button>reescribir</button>,
}));

describe('Showcase (disclosure)', () => {
  it('el botón tiene aria-expanded y aria-controls y togglea el contenido', () => {
    render(
      <Showcase title="Título" description="desc" icon={<span>X</span>}>
        <p>contenido ejemplo</p>
      </Showcase>
    );
    const button = screen.getByRole('button', { name: /Ver ejemplo/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls');
    const contentId = button.getAttribute('aria-controls')!;

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const content = screen.getByText('contenido ejemplo').parentElement!;
    expect(content).toHaveAttribute('id', contentId);

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('contenido ejemplo')).not.toBeInTheDocument();
  });
});

describe('RewritePanel (disclosure)', () => {
  it('togglea con aria-expanded/aria-controls', () => {
    render(
      <RewritePanel
        scrapedData={{
          url: 'https://x.com',
          title: 'T',
          description: '',
          h1: [],
          paragraphs: [],
          keywords: [],
          images: [],
          links: [],
          canonical: null,
          ogTags: [],
          twitterTags: [],
          langAttribute: null,
          schemaMarkup: false,
          metaRobots: null,
          internalLinks: [],
          externalLinks: [],
        }}
      />
    );
    const button = screen.getByRole('button', { name: /Reescritura asistida por IA/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'rewrite-panel-content');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
