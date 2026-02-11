import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch analyses from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: analyses } = await supabase
      .from('analyses')
      .select('created_at, analysis_type, url')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (!analyses) {
      return NextResponse.json({ byDate: [], byType: [], topUrls: [] });
    }

    // Aggregate by date
    const dateMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const urlMap = new Map<string, number>();

    for (const a of analyses) {
      const date = new Date(a.created_at).toISOString().slice(0, 10);
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
      typeMap.set(a.analysis_type, (typeMap.get(a.analysis_type) || 0) + 1);
      urlMap.set(a.url, (urlMap.get(a.url) || 0) + 1);
    }

    const byDate = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
    const byType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));
    const topUrls = Array.from(urlMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }));

    return NextResponse.json({ byDate, byType, topUrls });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
