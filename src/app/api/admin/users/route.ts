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
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'all'; // all, blocked, active, pro

  const supabaseAdmin = createAdminClient();
  const offset = (page - 1) * limit;

  try {
    // Query base: obtener usuarios con sus datos
    let usersQuery = supabaseAdmin
      .from('subscriptions')
      .select(`
        user_id,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        current_period_end,
        created_at
      `)
      .order('created_at', { ascending: false });

    // Obtener info de auth.users
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: limit
    });

    if (!authData?.users) {
      return NextResponse.json({ users: [], total: 0 });
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
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        is_blocked: metadata?.is_blocked || false,
        blocked_at: metadata?.blocked_at,
        blocked_reason: metadata?.blocked_reason,
        subscription_status: subscription?.status || 'free',
        stripe_customer_id: subscription?.stripe_customer_id,
        current_period_end: subscription?.current_period_end,
        total_analyses: analysisCount,
      };
    });

    // Aplicar filtros
    let filteredUsers = users;

    if (search) {
      filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === 'blocked') {
      filteredUsers = filteredUsers.filter(u => u.is_blocked);
    } else if (filter === 'active') {
      filteredUsers = filteredUsers.filter(u => !u.is_blocked);
    } else if (filter === 'pro') {
      filteredUsers = filteredUsers.filter(u => u.subscription_status === 'active');
    }

    return NextResponse.json({
      users: filteredUsers,
      total: users.length,
      page,
      limit,
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}