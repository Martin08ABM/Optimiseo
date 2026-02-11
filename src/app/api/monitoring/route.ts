import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';

// GET: List user's monitored URLs
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: urls, error } = await supabase
      .from('monitored_urls')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ urls: urls || [] });
  } catch (error) {
    console.error('Monitoring list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add URL to monitoring
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check Pro plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single();

    if (subscription?.plan_id !== 'pro') {
      return NextResponse.json(
        { error: 'La monitorización requiere el plan Pro' },
        { status: 403 }
      );
    }

    const { url, frequency = 'weekly' } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }

    // Validate URL
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Check limit (max 10 URLs)
    const { count } = await supabase
      .from('monitored_urls')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count || 0) >= 10) {
      return NextResponse.json(
        { error: 'Límite de 10 URLs monitorizadas alcanzado' },
        { status: 429 }
      );
    }

    // Validate frequency
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    const freq = validFrequencies.includes(frequency) ? frequency : 'weekly';

    const { data, error } = await supabase
      .from('monitored_urls')
      .insert({ user_id: user.id, url, frequency: freq })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Esta URL ya está siendo monitorizada' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ url: data }, { status: 201 });
  } catch (error) {
    console.error('Monitoring add error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
