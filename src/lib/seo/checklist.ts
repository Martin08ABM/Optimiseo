import type { ScrapedContent } from '@/src/app/api/ai/shared/types';

export interface ChecklistItem {
  id: string;
  category: 'meta' | 'contenido' | 'imagenes' | 'enlaces' | 'tecnico';
  label: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
}

export interface SEOChecklist {
  items: ChecklistItem[];
  summary: { pass: number; fail: number; warning: number; total: number };
}

const CATEGORY_LABELS: Record<string, string> = {
  meta: 'Meta Tags',
  contenido: 'Contenido',
  imagenes: 'Imágenes',
  enlaces: 'Enlaces',
  tecnico: 'Técnico',
};

export { CATEGORY_LABELS };

export function generateSEOChecklist(data: ScrapedContent): SEOChecklist {
  const items: ChecklistItem[] = [];

  // === META ===
  // Title
  if (!data.title) {
    items.push({ id: 'title', category: 'meta', label: 'Etiqueta <title>', status: 'fail', detail: 'No se encontró etiqueta title' });
  } else if (data.title.length < 30) {
    items.push({ id: 'title', category: 'meta', label: 'Etiqueta <title>', status: 'warning', detail: `Title demasiado corto (${data.title.length} caracteres, recomendado 30-60)` });
  } else if (data.title.length > 60) {
    items.push({ id: 'title', category: 'meta', label: 'Etiqueta <title>', status: 'warning', detail: `Title demasiado largo (${data.title.length} caracteres, recomendado 30-60)` });
  } else {
    items.push({ id: 'title', category: 'meta', label: 'Etiqueta <title>', status: 'pass', detail: `Title correcto (${data.title.length} caracteres)` });
  }

  // Meta description
  if (!data.description) {
    items.push({ id: 'description', category: 'meta', label: 'Meta description', status: 'fail', detail: 'No se encontró meta description' });
  } else if (data.description.length < 70) {
    items.push({ id: 'description', category: 'meta', label: 'Meta description', status: 'warning', detail: `Demasiado corta (${data.description.length} caracteres, recomendado 70-160)` });
  } else if (data.description.length > 160) {
    items.push({ id: 'description', category: 'meta', label: 'Meta description', status: 'warning', detail: `Demasiado larga (${data.description.length} caracteres, recomendado 70-160)` });
  } else {
    items.push({ id: 'description', category: 'meta', label: 'Meta description', status: 'pass', detail: `Longitud correcta (${data.description.length} caracteres)` });
  }

  // Open Graph
  const hasOgTitle = data.ogTags?.some(t => t.property === 'og:title');
  const hasOgDesc = data.ogTags?.some(t => t.property === 'og:description');
  const hasOgImage = data.ogTags?.some(t => t.property === 'og:image');
  if (hasOgTitle && hasOgDesc && hasOgImage) {
    items.push({ id: 'og', category: 'meta', label: 'Open Graph tags', status: 'pass', detail: 'og:title, og:description y og:image presentes' });
  } else if (hasOgTitle || hasOgDesc) {
    const missing = [!hasOgTitle && 'og:title', !hasOgDesc && 'og:description', !hasOgImage && 'og:image'].filter(Boolean).join(', ');
    items.push({ id: 'og', category: 'meta', label: 'Open Graph tags', status: 'warning', detail: `Faltan: ${missing}` });
  } else {
    items.push({ id: 'og', category: 'meta', label: 'Open Graph tags', status: 'warning', detail: 'No se encontraron Open Graph tags' });
  }

  // Canonical
  if (data.canonical) {
    items.push({ id: 'canonical', category: 'meta', label: 'Canonical tag', status: 'pass', detail: `Canonical: ${data.canonical}` });
  } else {
    items.push({ id: 'canonical', category: 'meta', label: 'Canonical tag', status: 'warning', detail: 'No se encontró canonical tag' });
  }

  // Lang attribute
  if (data.langAttribute) {
    items.push({ id: 'lang', category: 'meta', label: 'Atributo lang', status: 'pass', detail: `Idioma: ${data.langAttribute}` });
  } else {
    items.push({ id: 'lang', category: 'meta', label: 'Atributo lang', status: 'warning', detail: 'No se encontró atributo lang en <html>' });
  }

  // === CONTENIDO ===
  // H1
  if (data.h1.length === 0) {
    items.push({ id: 'h1', category: 'contenido', label: 'Encabezado H1', status: 'fail', detail: 'No se encontró ningún H1' });
  } else if (data.h1.length > 1) {
    items.push({ id: 'h1', category: 'contenido', label: 'Encabezado H1', status: 'warning', detail: `Se encontraron ${data.h1.length} H1 (recomendado: solo 1)` });
  } else {
    items.push({ id: 'h1', category: 'contenido', label: 'Encabezado H1', status: 'pass', detail: 'H1 único presente' });
  }

  // H2 subheadings
  if (data.wordCount > 500 && data.h2.length === 0) {
    items.push({ id: 'h2', category: 'contenido', label: 'Subencabezados H2', status: 'warning', detail: 'No se encontraron H2 en una página con más de 500 palabras' });
  } else if (data.h2.length > 0) {
    items.push({ id: 'h2', category: 'contenido', label: 'Subencabezados H2', status: 'pass', detail: `${data.h2.length} subencabezados H2 encontrados` });
  }

  // Word count
  if (data.wordCount < 100) {
    items.push({ id: 'wordcount', category: 'contenido', label: 'Cantidad de palabras', status: 'fail', detail: `Solo ${data.wordCount} palabras (mínimo recomendado: 300)` });
  } else if (data.wordCount < 300) {
    items.push({ id: 'wordcount', category: 'contenido', label: 'Cantidad de palabras', status: 'warning', detail: `${data.wordCount} palabras (recomendado: más de 300)` });
  } else {
    items.push({ id: 'wordcount', category: 'contenido', label: 'Cantidad de palabras', status: 'pass', detail: `${data.wordCount} palabras` });
  }

  // === IMAGENES ===
  if (data.images.length > 0) {
    const withoutAlt = data.images.filter(img => !img.alt || img.alt.trim() === '');
    const pct = (withoutAlt.length / data.images.length) * 100;
    if (withoutAlt.length === 0) {
      items.push({ id: 'img-alt', category: 'imagenes', label: 'Texto alt en imágenes', status: 'pass', detail: `Todas las ${data.images.length} imágenes tienen alt` });
    } else if (pct > 50) {
      items.push({ id: 'img-alt', category: 'imagenes', label: 'Texto alt en imágenes', status: 'fail', detail: `${withoutAlt.length} de ${data.images.length} imágenes sin alt (${Math.round(pct)}%)` });
    } else {
      items.push({ id: 'img-alt', category: 'imagenes', label: 'Texto alt en imágenes', status: 'warning', detail: `${withoutAlt.length} de ${data.images.length} imágenes sin alt` });
    }
  } else {
    items.push({ id: 'img-alt', category: 'imagenes', label: 'Imágenes', status: 'warning', detail: 'No se encontraron imágenes en la página' });
  }

  // === ENLACES ===
  const intCount = data.internalLinks?.length || 0;
  const extCount = data.externalLinks?.length || 0;

  if (intCount === 0) {
    items.push({ id: 'internal-links', category: 'enlaces', label: 'Enlaces internos', status: 'warning', detail: 'No se encontraron enlaces internos' });
  } else {
    items.push({ id: 'internal-links', category: 'enlaces', label: 'Enlaces internos', status: 'pass', detail: `${intCount} enlaces internos` });
  }

  if (extCount === 0 && data.wordCount > 300) {
    items.push({ id: 'external-links', category: 'enlaces', label: 'Enlaces externos', status: 'warning', detail: 'No se encontraron enlaces externos' });
  } else if (extCount > 0) {
    items.push({ id: 'external-links', category: 'enlaces', label: 'Enlaces externos', status: 'pass', detail: `${extCount} enlaces externos` });
  }

  // === TECNICO ===
  // Schema markup
  if (data.schemaMarkup) {
    items.push({ id: 'schema', category: 'tecnico', label: 'Schema / JSON-LD', status: 'pass', detail: 'Datos estructurados encontrados' });
  } else {
    items.push({ id: 'schema', category: 'tecnico', label: 'Schema / JSON-LD', status: 'warning', detail: 'No se encontraron datos estructurados' });
  }

  // Meta robots
  if (data.metaRobots && data.metaRobots.toLowerCase().includes('noindex')) {
    items.push({ id: 'robots', category: 'tecnico', label: 'Meta robots', status: 'fail', detail: 'La página tiene noindex activado' });
  } else {
    items.push({ id: 'robots', category: 'tecnico', label: 'Meta robots', status: 'pass', detail: data.metaRobots ? `robots: ${data.metaRobots}` : 'Sin restricciones de indexación' });
  }

  const summary = {
    pass: items.filter(i => i.status === 'pass').length,
    fail: items.filter(i => i.status === 'fail').length,
    warning: items.filter(i => i.status === 'warning').length,
    total: items.length,
  };

  return { items, summary };
}
