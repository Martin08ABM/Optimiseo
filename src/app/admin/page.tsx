import { StatsCard } from '@/src/components/admin/StatsCard';
import { createAdminClient } from '@/src/lib/supabase/admin';

async function getOverviewStats() {
  const supabaseAdmin = createAdminClient();

  try {
    // Total de usuarios únicos que han hecho análisis
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

    return {
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
    };
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return null;
  }
}

export default async function AdminDashboard() {
  const stats = await getOverviewStats();

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error al cargar estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
        <p className="mt-2 text-gray-300">Vista general del sistema</p>
      </div>

      {/* Usuarios */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Usuarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Usuarios"
            value={stats.users.total}
            subtitle={`${stats.users.newThisMonth} nuevos este mes`}
          />
          <StatsCard
            title="Usuarios Pro"
            value={stats.users.pro}
            subtitle={`${stats.users.total > 0 ? ((stats.users.pro / stats.users.total) * 100).toFixed(1) : 0}% conversión`}
          />
          <StatsCard
            title="Usuarios Free"
            value={stats.users.free}
          />
          <StatsCard
            title="Bloqueados"
            value={stats.users.blocked}
          />
        </div>
      </div>

      {/* Análisis */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Análisis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="Total Análisis"
            value={stats.analyses.total.toLocaleString()}
          />
          <StatsCard
            title="Análisis este mes"
            value={stats.analyses.thisMonth.toLocaleString()}
            subtitle={`${(stats.analyses.thisMonth / 30).toFixed(1)} por día`}
          />
        </div>
      </div>

      {/* Ingresos */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Ingresos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="MRR (Monthly Recurring Revenue)"
            value={`€${stats.revenue.mrr}`}
            subtitle={`${stats.revenue.activeSubscriptions} suscripciones activas`}
          />
          <StatsCard
            title="Códigos de Descuento"
            value={stats.discounts.activeCodes}
            subtitle={`${stats.discounts.usedThisMonth} usados este mes`}
          />
        </div>
      </div>

      {/* Links rápidos */}
      <div className="bg-gray-800 border-2 border-gray-600 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="block p-4 border-2 border-gray-600 rounded-lg hover:border-blue-500 transition text-center bg-gray-700"
          >
            <div className="font-semibold text-white">Gestionar Usuarios</div>
            <div className="text-sm text-gray-400 mt-1">Bloquear, ver detalles</div>
          </a>
          <a
            href="/admin/discount-codes"
            className="block p-4 border-2 border-gray-600 rounded-lg hover:border-blue-500 transition text-center bg-gray-700"
          >
            <div className="font-semibold text-white">Códigos de Descuento</div>
            <div className="text-sm text-gray-400 mt-1">Crear, editar, desactivar</div>
          </a>
          <a
            href="/dashboard"
            className="block p-4 border-2 border-gray-600 rounded-lg hover:border-blue-500 transition text-center bg-gray-700"
          >
            <div className="font-semibold text-white">Dashboard Usuario</div>
            <div className="text-sm text-gray-400 mt-1">Vista normal</div>
          </a>
        </div>
      </div>
    </div>
  );
}
