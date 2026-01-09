/**
 * Componente Hero - Sección principal de la landing page
 *
 * Este componente muestra el mensaje principal de la aplicación en la página de inicio.
 * Presenta el valor principal de OptimiSEO de forma clara y centrada.
 *
 * @component
 * @returns {JSX.Element} Sección hero con el mensaje principal
 */
export default function Hero() {
  return (
    <section className="flex flex-col gap-4 mt-4 items-center">
      <p className="font-title text-white text-md md:text-lg max-w-2xl md:max-w-3xl font-black text-center">
        Tu ayudante para impulsar tus páginas optimizando el SEO sin parecer un
        robot
      </p>
    </section>
  );
}
