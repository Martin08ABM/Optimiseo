export default function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div
      className="flex flex-col px-4 py-2 min-h-screen bg-linear-to-b from-slate-900 via-zinc-950 to-black"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center justify-center mx-auto mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white" />
        <p className="text-white mt-4">{label}</p>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
