import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('created_at, result')
      .eq('user_id', user.id)
      .eq('url', url)
      .eq('analysis_type', 'monitoring-check')
      .order('created_at', { ascending: true })
      .limit(90);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const history = (analyses || []).map(a => ({
      date: a.created_at,
      score: (a.result as Record<string, unknown>)?.scores
        ? ((a.result as Record<string, unknown>).scores as Record<string, unknown>)?.overall as number || 0
        : 0,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Monitoring history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
