import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { scrapeURL } from '@/src/app/api/ai/shared/webSearch';
import { generateSEOChecklist } from '@/src/lib/seo/checklist';

const FREQUENCY_INTERVALS: Record<string, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Fetch active URLs that are due for checking
    const { data: urls, error: fetchError } = await supabaseAdmin
      .from('monitored_urls')
      .select('*')
      .eq('is_active', true)
      .order('last_checked', { ascending: true, nullsFirst: true })
      .limit(10);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Filter URLs that are actually due
    const dueUrls = (urls || []).filter(url => {
      if (!url.last_checked) return true;
      const lastChecked = new Date(url.last_checked);
      const intervalDays = FREQUENCY_INTERVALS[url.frequency] || 7;
      const nextCheck = new Date(lastChecked.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      return now >= nextCheck;
    });

    const results = [];

    for (const monitoredUrl of dueUrls) {
      try {
        // Scrape the URL
        const scrapedData = await scrapeURL(monitoredUrl.url);

        // Generate checklist-based score
        const checklist = generateSEOChecklist(scrapedData);
        const score = Math.round((checklist.summary.pass / checklist.summary.total) * 100);

        // Save as monitoring-check analysis
        await supabaseAdmin.from('analyses').insert({
          user_id: monitoredUrl.user_id,
          url: monitoredUrl.url,
          analysis_type: 'monitoring-check',
          result: {
            response: `Chequeo automático - Score: ${score}/100\n\nAprobados: ${checklist.summary.pass}, Advertencias: ${checklist.summary.warning}, Fallidos: ${checklist.summary.fail}`,
            scores: { overall: score, categories: {} },
          },
          scraped_data: scrapedData,
          plan_used: 'pro',
        });

        // Update monitored URL
        await supabaseAdmin
          .from('monitored_urls')
          .update({
            last_checked: now.toISOString(),
            last_score: score,
            updated_at: now.toISOString(),
          })
          .eq('id', monitoredUrl.id);

        results.push({ url: monitoredUrl.url, score, status: 'ok' });
      } catch (err) {
        console.error(`Error checking ${monitoredUrl.url}:`, err);
        results.push({ url: monitoredUrl.url, status: 'error' });
      }
    }

    return NextResponse.json({ checked: results.length, results });
  } catch (error) {
    console.error('Monitoring check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
