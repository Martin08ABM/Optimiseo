import type { MetadataRoute } from 'next';

const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://optimiseo.pro';
const BASE_URL = raw.startsWith('http') ? raw : `http://${raw}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
