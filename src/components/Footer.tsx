import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto border-t border-gray-800 max-w-full">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-400 text-sm">
          &copy; 2026 OptimiSEO. Todos los derechos reservados.
        </p>
        <p className="text-gray-400 text-sm">
          Hecho por{' '}
          <Link href="https://github.com/Martin08ABM" className="text-blue-400 hover:underline">
            Martin Adolfo
          </Link>
        </p>
        <nav aria-label="Enlaces legales">
          <ul className="flex gap-4 text-sm">
            <li>
              <Link href="/guia-html" className="text-gray-400 hover:text-white hover:underline">
                Guía HTML
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-gray-400 hover:text-white hover:underline">
                Precios
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
