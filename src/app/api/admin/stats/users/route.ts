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
    // Obtener todos los usuarios
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();

    if (!authData?.users) {
      return NextResponse.json({ error: 'No se pudieron obtener usuarios' }, { status: 500 });
    }

    // Calcular fecha límite
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    // Agrupar usuarios por día
    const usersByDay: { [key: string]: number } = {};

    authData.users.forEach(user => {
      const createdDate = new Date(user.created_at);
      if (createdDate >= dateLimit) {
        const dateKey = createdDate.toISOString().split('T')[0];
        usersByDay[dateKey] = (usersByDay[dateKey] || 0) + 1;
      }
    });

    // Crear array con todos los días (incluyendo días sin registros)
    const timeline = [];
    let cumulativeTotal = authData.users.filter(u => new Date(u.created_at) < dateLimit).length;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const newUsers = usersByDay[dateKey] || 0;
      cumulativeTotal += newUsers;

      timeline.push({
        date: dateKey,
        newUsers,
        totalUsers: cumulativeTotal,
      });
    }

    // Distribución por plan
    const { count: proCount } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const totalUsers = authData.users.length;
    const freeCount = totalUsers - (proCount || 0);

    return NextResponse.json({
      timeline,
      distribution: {
        free: freeCount,
        pro: proCount || 0,
      },
      summary: {
        total: totalUsers,
        averagePerDay: (timeline.reduce((sum, day) => sum + day.newUsers, 0) / days).toFixed(2),
      },
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de usuarios' },
      { status: 500 }
    );
  }
}