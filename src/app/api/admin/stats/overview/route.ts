import { NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/admin/auth';
import { createAdminClient } from '@/src/lib/supabase/admin';

export async function GET() {
  // Verificar que el usuario es admin
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }

  const supabaseAdmin = createAdminClient();

  try {
    // Total de usuarios
    const { count: totalUsers } = await supabaseAdmin
      .from('analyses')
      .select('user_id', { count: 'exact', head: true });

    // Usuarios Pro activos
    const { count: proUsers } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Usuarios bloqueados
    const { count: blockedUsers } = await supabaseAdmin
      .from('user_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('is_blocked', true);

    // Total de análisis realizados
    const { count: totalAnalyses } = await supabaseAdmin
      .from('analyses')
      .select('*', { count: 'exact', head: true });

    // Análisis este mes
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { count: analysesThisMonth } = await supabaseAdmin
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString());

    // Nuevos usuarios este mes
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const newUsersThisMonth = authData?.users?.filter(u => {
      const createdAt = new Date(u.created_at);
      return createdAt >= firstDayOfMonth;
    }).length || 0;

    // Códigos de descuento activos
    const { count: activeDiscountCodes } = await supabaseAdmin
      .from('discount_codes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Uso de códigos este mes
    const { count: discountUsageThisMonth } = await supabaseAdmin
      .from('discount_code_usage')
      .select('*', { count: 'exact', head: true })
      .gte('used_at', firstDayOfMonth.toISOString());

    // Calcular MRR (Monthly Recurring Revenue) - asumiendo 9.99€ por suscripción
    const mrr = (proUsers || 0) * 9.99;

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        pro: proUsers || 0,
        free: (totalUsers || 0) - (proUsers || 0),
        blocked: blockedUsers || 0,
        newThisMonth: newUsersThisMonth,
      },
      analyses: {
        total: totalAnalyses || 0,
        thisMonth: analysesThisMonth || 0,
      },
      revenue: {
        mrr: mrr.toFixed(2),
        activeSubscriptions: proUsers || 0,
      },
      discounts: {
        activeCodes: activeDiscountCodes || 0,
        usedThisMonth: discountUsageThisMonth || 0,
      },
    });

  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}