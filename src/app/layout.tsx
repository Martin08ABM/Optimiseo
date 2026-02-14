/**
 * Layout raíz de la aplicación
 *
 * Este es el layout principal que envuelve todas las páginas de la aplicación.
 *
 * Características:
 * - Configura las fuentes personalizadas (Atkinson Hyperlegible y Google Sans Code)
 * - Define los metadatos de la aplicación (título y descripción)
 * - Establece el idioma de la aplicación (español)
 * - Aplica estilos globales y variables CSS
 *
 * Las fuentes se cargan localmente desde la carpeta public/fonts para mejor rendimiento.
 *
 * @layout
 * @param {Object} props - Propiedades del layout
 * @param {React.ReactNode} props.children - Contenido de las páginas hijas
 * @returns {JSX.Element} Layout raíz de la aplicación
 */

import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import Script from "next/script";

// Configuración de la fuente Atkinson Hyperlegible
// Fuente monoespaciada optimizada para legibilidad
export const atkinsonHyperlegible = localFont({
  src: [
    {
      path: "../../public/fonts/AtkinsonHyperlegibleMono-VariableFont_wght.woff2",
      style: "normal",
    },
  ],
  variable: "--atkinson-hyperlegible",
})

// Configuración de la fuente Google Sans Code
// Fuente sans-serif moderna para código y UI
export const googleSansCode = localFont({
    src: [
      {
        path: "../../public/fonts/GoogleSansCode-VariableFont_wght.woff2",
        weight: "400",
        style: "normal",
      },
    ],
  variable: "--google-sans-code",
})

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://optimiseo.pro';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `http://${raw}`;
}

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'OptimiSEO — Optimización SEO con IA',
    template: '%s | OptimiSEO',
  },
  description:
    'Analiza y optimiza el SEO de tus páginas web con inteligencia artificial. Mejora la legibilidad, detecta repeticiones y evalúa la coherencia de tu contenido.',
  keywords: ['SEO', 'optimización', 'inteligencia artificial', 'análisis web', 'legibilidad', 'contenido'],
  authors: [{ name: 'OptimiSEO' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: BASE_URL,
    siteName: 'OptimiSEO',
    title: 'OptimiSEO — Optimización SEO con IA',
    description:
      'Analiza y optimiza el SEO de tus páginas web con inteligencia artificial. Mejora la legibilidad, detecta repeticiones y evalúa la coherencia.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'OptimiSEO' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OptimiSEO — Optimización SEO con IA',
    description:
      'Analiza y optimiza el SEO de tus páginas web con inteligencia artificial.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Componente RootLayout
 *
 * Envuelve toda la aplicación con la configuración de fuentes,
 * idioma y estilos globales.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${atkinsonHyperlegible.variable} ${googleSansCode.variable} antialiased`}>
    <head>
        <script defer data-domain="optimiseo.pro" src="https://analytics.optimiseo.pro/js/script.js"></script>
        {/* Matomo Tag Manager */}
        <Script
          id="matomo-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _mtm = window._mtm = window._mtm || [];
              _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
              (function() {
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.async=true; g.src='https://cdn.matomo.cloud/optimiseo.matomo.cloud/container_seVuGRtt.js';
                s.parentNode.insertBefore(g,s);
              })();
            `,
          }}
        />
    </head>
      <body cz-shortcut-listen="true">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'OptimiSEO',
              url: BASE_URL,
              description:
                'Analiza y optimiza el SEO de tus páginas web con inteligencia artificial.',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'AggregateOffer',
                lowPrice: '0',
                highPrice: '12',
                priceCurrency: 'EUR',
                offerCount: 2,
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
