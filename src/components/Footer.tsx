import Link from "next/dist/client/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto border-2 border-black max-w-full">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-400">
          &copy; 2026 OptimiSEO. Todos los derechos reservados.
        </p>
        <p>Hecho por <Link href="https://github.com/Martin08ABM">Martin Adolfo</Link></p>
      </div>
    </footer>
  )
}