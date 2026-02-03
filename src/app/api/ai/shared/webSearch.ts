import * as cheerio from 'cheerio';
import type { ScrapedContent } from './types';

const USER_AGENT = 'Mozilla/5.0 (compatible; OptimiSEO/1.0; +https://optimiseo.com)';
const TIMEOUT = 10000;

function extractKeywords(text: string): { word: string; count: number }[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  const stopWords = new Set([
    'para', 'con', 'por', 'como', 'más', 'pero', 'este', 'esta', 'estos', 'estas',
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'been', 'were',
    'about', 'also', 'into', 'than', 'them', 'then', 'there', 'these', 'they'
  ]);
  
  return Array.from(wordCount.entries())
    .filter(([word]) => !stopWords.has(word))
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Función helper para validar URLs
function isValidURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function scrapeURL(url: string): Promise<ScrapedContent> {
  // Validación temprana de URL
  if (!isValidURL(url)) {
    return {
      url,
      title: '',
      description: '',
      h1: [],
      h2: [],
      h3: [],
      paragraphs: [],
      wordCount: 0,
      keywords: [],
      images: [],
      links: [],
      error: 'URL inválida. Debe comenzar con http:// o https://',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Limpieza de elementos no deseados
    $('script, style, noscript, iframe, nav, footer, header').remove();
    
    // Extracción de metadatos
    const title = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  '';
    
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       '';
    
    // Headings
    const h1 = $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h2 = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const h3 = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    
    // Párrafos (filtrando los muy cortos)
    const paragraphs = $('p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(p => p.length > 20) // Mínimo 20 caracteres
      .slice(0, 10);
    
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = calculateWordCount(bodyText);
    const keywords = extractKeywords(bodyText);
    
    // Imágenes (resolviendo URLs relativas)
    const images = $('img')
      .map((_, el) => {
        const src = $(el).attr('src') || '';
        const alt = $(el).attr('alt') || '';
        
        // Resolver URLs relativas
        let absoluteSrc = src;
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
          try {
            absoluteSrc = new URL(src, url).href;
          } catch {
            absoluteSrc = src;
          }
        }
        
        return { src: absoluteSrc, alt };
      })
      .get()
      .filter(img => img.src && !img.src.startsWith('data:')) // Excluir data URIs
      .slice(0, 20);
    
    // Links (resolviendo URLs relativas y filtrando duplicados)
    const seenHrefs = new Set<string>();
    const links = $('a[href]')
      .map((_, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        
        // Resolver URLs relativas
        let absoluteHref = href;
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
          try {
            absoluteHref = new URL(href, url).href;
          } catch {
            absoluteHref = href;
          }
        }
        
        return { href: absoluteHref, text };
      })
      .get()
      .filter(link => {
        // Filtrar anclas, duplicados y enlaces vacíos
        if (!link.href || link.href.startsWith('#') || seenHrefs.has(link.href)) {
          return false;
        }
        seenHrefs.add(link.href);
        return true;
      })
      .slice(0, 30);
    
    return {
      url,
      title,
      description,
      h1,
      h2,
      h3,
      paragraphs,
      wordCount,
      keywords,
      images,
      links,
    };
    
  } catch (error: unknown) {
    const errorObj = error as Error;
    console.error(`Error scraping ${url}:`, errorObj.message);

    // Mensaje de error más específico
    let errorMessage = 'Error desconocido al acceder a la URL';
    if (errorObj.name === 'AbortError') {
      errorMessage = 'Timeout: La página tardó demasiado en responder';
    } else if (errorObj.message) {
      errorMessage = errorObj.message;
    }
    
    return {
      url,
      title: '',
      description: '',
      h1: [],
      h2: [],
      h3: [],
      paragraphs: [],
      wordCount: 0,
      keywords: [],
      images: [],
      links: [],
      error: errorMessage,
    };
  }
}