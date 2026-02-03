export default function Loading() {
  return (
    <div className="flex flex-col px-4 py-2 min-h-screen bg-gray-700">
      <div className="flex flex-col items-center justify-center mx-auto mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        <p className="text-white mt-4 text-lg">Cargando dashboard...</p>
      </div>
    </div>
  );
}
