export default function Loading() {
  return (
    <div
      className="flex flex-col px-4 py-2 min-h-screen bg-linear-to-b from-slate-900 via-zinc-950 to-black"
      role="status"
      aria-live="polite"
      aria-label="Cargando dashboard"
    >
      <div className="flex flex-col items-center justify-center mx-auto mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white" />
        <p className="text-white mt-4 text-lg">Cargando dashboard…</p>
      </div>
      <span className="sr-only">El dashboard se está cargando, espera por favor.</span>
    </div>
  );
}
