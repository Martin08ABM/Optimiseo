/**
 * Página principal de la aplicación OptimiSEO
 *
 * Esta es la landing page que se muestra cuando el usuario accede a la raíz del sitio.
 * Renderiza el header de navegación y el hero con el mensaje principal.
 *
 * @component
 * @returns {JSX.Element} Página de inicio con header y hero
 */

'use server';
import Hero from "@/src/components/Hero";
import Header from "@/src/components/Header";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-gray-600 to-gray-950 min-w-full">
      <Header />
      <Hero />
    </div>
  );
}
