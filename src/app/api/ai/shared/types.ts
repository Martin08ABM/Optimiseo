export interface ScrapedContent {
  url: string;
  title: string;
  description: string;
  h1: string[];
  h2: string[];
  h3: string[];
  paragraphs: string[];
  wordCount: number;
  keywords: { word: string; count: number }[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string }[];
  error?: string;
  canonical?: string | null;
  ogTags?: { property: string; content: string }[];
  twitterTags?: { name: string; content: string }[];
  langAttribute?: string | null;
  schemaMarkup?: boolean;
  metaRobots?: string | null;
  internalLinks?: { href: string; text: string }[];
  externalLinks?: { href: string; text: string }[];
}

export interface AIRequest {
  prompt: string;
  context?: {
    selection?: string;
    role?: string;
  };
}

export interface AIResponse {
  message: string;
  model: string;
  provider: 'claude';
  selection?: string;
  fallbackUsed?: boolean;
  scrapedData?: ScrapedContent;
}

export interface ProviderConfig {
  name: 'claude';
  endpoint: string;
  enabled: boolean;
}
