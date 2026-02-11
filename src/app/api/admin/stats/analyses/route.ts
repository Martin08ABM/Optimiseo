import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/admin/auth';
import { createAdminClient } from '@/src/lib/supabase/admin';

export async function GET(request: NextRequest) {
  // Verificar que el usuario es admin
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  const supabaseAdmin = createAdminClient();

  try {
    // Calcular fecha límite
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    // Obtener todos los análisis del período
    const { data: analyses } = await supabaseAdmin
      .from('analyses')
      .select('analysis_type, created_at')
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: true });

    if (!analyses) {
      return NextResponse.json({ error: 'No se pudieron obtener análisis' }, { status: 500 });
    }

    // Agrupar por tipo
    const byType: { [key: string]: number } = {};
    analyses.forEach(analysis => {
      byType[analysis.analysis_type] = (byType[analysis.analysis_type] || 0) + 1;
    });

    // Convertir a array para el gráfico de pie
    const distributionData = Object.entries(byType).map(([type, count]) => ({
      type,
      count,
      percentage: ((count / analyses.length) * 100).toFixed(2),
    }));

    // Agrupar por día y tipo
    const timelineByType: { [key: string]: { [type: string]: number } } = {};

    analyses.forEach(analysis => {
      const dateKey = new Date(analysis.created_at).toISOString().split('T')[0];
      if (!timelineByType[dateKey]) {
        timelineByType[dateKey] = {};
      }
      timelineByType[dateKey][analysis.analysis_type] =
        (timelineByType[dateKey][analysis.analysis_type] || 0) + 1;
    });

    // Crear timeline completo
    const timeline = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const dayData: any = {
        date: dateKey,
        total: 0,
      };

      // Agregar conteo por tipo
      if (timelineByType[dateKey]) {
        Object.entries(timelineByType[dateKey]).forEach(([type, count]) => {
          dayData[type] = count;
          dayData.total += count as number;
        });
      }

      timeline.push(dayData);
    }

    // Top usuarios por análisis
    const analysesByUser: { [key: string]: number } = {};
    analyses.forEach(analysis => {
      if (analysis.created_at) {
        analysesByUser[analysis.created_at] = (analysesByUser[analysis.created_at] || 0) + 1;
      }
    });

    return NextResponse.json({
      distribution: distributionData,
      timeline,
      summary: {
        total: analyses.length,
        averagePerDay: (analyses.length / days).toFixed(2),
        mostUsedType: distributionData.sort((a, b) => b.count - a.count)[0]?.type || 'N/A',
      },
    });

  } catch (error) {
    console.error('Error fetching analyses stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de análisis' },
      { status: 500 }
    );
  }
}