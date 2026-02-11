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
  const months = parseInt(searchParams.get('months') || '12');

  const supabaseAdmin = createAdminClient();

  try {
    // Precio de suscripción (hardcodeado, podrías sacarlo de config)
    const SUBSCRIPTION_PRICE = 9.99;

    // Obtener todas las suscripciones
    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!subscriptions) {
      return NextResponse.json({ error: 'No se pudieron obtener suscripciones' }, { status: 500 });
    }

    // Calcular fecha límite
    const dateLimit = new Date();
    dateLimit.setMonth(dateLimit.getMonth() - months);

    // Agrupar por mes
    const revenueByMonth: { [key: string]: { new: number; churned: number; net: number } } = {};

    subscriptions.forEach(sub => {
      const createdDate = new Date(sub.created_at);
      if (createdDate >= dateLimit) {
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        if (!revenueByMonth[monthKey]) {
          revenueByMonth[monthKey] = { new: 0, churned: 0, net: 0 };
        }
        revenueByMonth[monthKey].new += SUBSCRIPTION_PRICE;
      }

      // Cancelaciones
      if (sub.canceled_at) {
        const canceledDate = new Date(sub.canceled_at);
        if (canceledDate >= dateLimit) {
          const monthKey = `${canceledDate.getFullYear()}-${String(canceledDate.getMonth() + 1).padStart(2, '0')}`;
          if (!revenueByMonth[monthKey]) {
            revenueByMonth[monthKey] = { new: 0, churned: 0, net: 0 };
          }
          revenueByMonth[monthKey].churned += SUBSCRIPTION_PRICE;
        }
      }
    });

    // Crear timeline
    const timeline = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthData = revenueByMonth[monthKey] || { new: 0, churned: 0, net: 0 };
      monthData.net = monthData.new - monthData.churned;

      timeline.push({
        month: monthKey,
        newRevenue: parseFloat(monthData.new.toFixed(2)),
        churnedRevenue: parseFloat(monthData.churned.toFixed(2)),
        netRevenue: parseFloat(monthData.net.toFixed(2)),
      });
    }

    // MRR actual
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const currentMRR = (activeSubscriptions || 0) * SUBSCRIPTION_PRICE;

    // Total histórico
    const totalRevenue = subscriptions.filter(s => s.status === 'active' || s.canceled_at).length * SUBSCRIPTION_PRICE;

    // Descuentos aplicados
    const { data: discountUsage } = await supabaseAdmin
      .from('discount_code_usage')
      .select('discount_amount');

    const totalDiscounts = discountUsage?.reduce((sum, usage) => sum + parseFloat(usage.discount_amount), 0) || 0;

    return NextResponse.json({
      timeline,
      summary: {
        currentMRR: parseFloat(currentMRR.toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalDiscounts: parseFloat(totalDiscounts.toFixed(2)),
        activeSubscriptions: activeSubscriptions || 0,
        lifetimeSubscriptions: subscriptions.length,
      },
    });

  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de ingresos' },
      { status: 500 }
    );
  }
}