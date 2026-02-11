import { UserTable } from '@/src/components/admin/UserTable';
import { createAdminClient } from '@/src/lib/supabase/admin';

async function getUsers() {
  const supabaseAdmin = createAdminClient();

  try {
    // Obtener info de auth.users (primeros 100)
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 100
    });

    if (!authData?.users) {
      return { users: [], total: 0 };
    }

    // Combinar datos
    const userIds = authData.users.map(u => u.id);

    // Obtener metadata de bloqueo
    const { data: metadataData } = await supabaseAdmin
      .from('user_metadata')
      .select('*')
      .in('user_id', userIds);

    // Obtener suscripciones
    const { data: subscriptionsData } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .in('user_id', userIds);

    // Obtener conteo de análisis
    const { data: analysesCount } = await supabaseAdmin
      .from('analyses')
      .select('user_id')
      .in('user_id', userIds);

    // Construir respuesta combinada
    const users = authData.users.map(user => {
      const metadata = metadataData?.find(m => m.user_id === user.id);
      const subscription = subscriptionsData?.find(s => s.user_id === user.id && s.status === 'active');
      const analysisCount = analysesCount?.filter(a => a.user_id === user.id).length || 0;

      return {
        id: user.id,
        email: user.email || 'Sin email',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || '',
        is_blocked: metadata?.is_blocked || false,
        blocked_at: metadata?.blocked_at,
        blocked_reason: metadata?.blocked_reason,
        subscription_status: subscription?.status || 'free',
        stripe_customer_id: subscription?.stripe_customer_id,
        current_period_end: subscription?.current_period_end,
        total_analyses: analysisCount,
      };
    });

    return { users, total: users.length };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], total: 0 };
  }
}

export default async function UsersPage() {
  const data = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
        <p className="mt-2 text-gray-300">
          Administra usuarios, bloquea cuentas y consulta detalles
        </p>
      </div>

      <UserTable initialUsers={data.users} total={data.total} />
    </div>
  );
}