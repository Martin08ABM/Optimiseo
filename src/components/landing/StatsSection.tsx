import { createAdminClient } from '@/src/lib/supabase/admin';

export default async function StatsSection() {
  let totalAnalyses = 0;

  try {
    const supabaseAdmin = createAdminClient();
    const { count } = await supabaseAdmin
      .from('analyses')
      .select('*', { count: 'exact', head: true });
    totalAnalyses = count || 0;
  } catch {
    // Silently fail - show 0
  }

  // Only show if there are analyses
  if (totalAnalyses === 0) return null;

  return (
    <section className="py-12 px-6 mb-8">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-4xl font-bold text-white">{totalAnalyses.toLocaleString('es-ES')}</p>
        <p className="text-gray-400 mt-2">análisis realizados con OptimiSEO</p>
      </div>
    </section>
  );
}
