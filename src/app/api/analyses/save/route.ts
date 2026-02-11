import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId, message, scrapedData } = await request.json();

    if (!analysisId) {
      return NextResponse.json({ error: 'Missing analysisId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('analyses')
      .update({
        result: { response: message },
        scraped_data: scrapedData || null,
      })
      .eq('id', analysisId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error saving analysis:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('Save analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
