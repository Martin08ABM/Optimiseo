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

// Metadatos globales de la aplicación
export const metadata: Metadata = {
  title: "Optimiseo",
  description: "AI-Powered SEO Optimization Tool Maintaining Your Unique Voice",
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
      <body cz-shortcut-listen="true">
        {children}
      </body>
    </html>
  );
}
