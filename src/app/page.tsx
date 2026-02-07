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
import RevisionTitleConcordancy from "../components/RevisionTitleConcordancy";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { getDailyUsage } from "@/src/lib/subscription/utils";

export default async function Home() {
  // Obtener información del usuario autenticado
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si está autenticado, obtener su uso diario
  let usage = undefined;
  if (user) {
    usage = await getDailyUsage(user.id);
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-gray-600 to-gray-950 min-w-full">
      <Header />
      <Hero isAuthenticated={!!user} usage={usage} />
      <div>
        <RevisionTitleConcordancy />
      </div>
    </div>
  );
}
