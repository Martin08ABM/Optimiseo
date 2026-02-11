import Header from '@/src/components/Header';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { getAnalysisHistory } from '@/src/lib/subscription/utils';
import CompareClient from '@/src/components/dashboard/CompareClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ComparePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', user.id)
    .single();

  const isPro = subscription?.plan_id === 'pro';

  if (!isPro) {
    return (
      <div className="flex flex-col px-4 py-2 min-h-screen bg-gray-700">
        <Header />
        <div className="max-w-4xl mx-auto w-full mt-6">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-3">Función exclusiva Pro</h2>
            <p className="text-gray-300 mb-6">
              Compara dos análisis de la misma URL para ver qué ha cambiado.
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Mejorar a Pro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const analyses = await getAnalysisHistory(user.id, 100);

  return (
    <div className="flex flex-col px-4 py-2 min-h-screen bg-gray-700">
      <Header />
      <div className="max-w-5xl mx-auto w-full mt-6">
        <h1 className="text-2xl font-bold text-white mb-6">Comparar análisis</h1>
        <CompareClient analyses={analyses} />
      </div>
    </div>
  );
}
