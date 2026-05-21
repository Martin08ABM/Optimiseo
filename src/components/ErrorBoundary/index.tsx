export { ErrorBoundary } from '../ErrorBoundary';

// Reusable fallback components
export function CardErrorFallback({ error }: { error: Error }) {
  return (
    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
      <h3 className="text-red-400 font-medium mb-1">Error al cargar este componente</h3>
      <p className="text-red-300 text-sm">{error.message}</p>
    </div>
  );
}

export function DashboardErrorFallback() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Error en el Dashboard</h2>
        <p className="text-gray-400 mb-4">No se pudo cargar el contenido del dashboard.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Inténtalo de nuevo
        </button>
      </div>
    </div>
  );
}

export function PageErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 shadow-xl text-center">
        <div className="text-red-400 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Error en la página</h2>
        <p className="text-gray-400 mb-4">No se pudo cargar esta página correctamente.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Recargar página
        </button>
      </div>
    </div>
  );
}
