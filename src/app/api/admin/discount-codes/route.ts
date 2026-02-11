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
  const includeInactive = searchParams.get('includeInactive') === 'true';

  const supabaseAdmin = createAdminClient();

  try {
    let query = supabaseAdmin
      .from('discount_codes')
      .select(`
        *,
        usage:discount_code_usage(count)
      `)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: codes, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ codes });

  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return NextResponse.json(
      { error: 'Error al obtener códigos de descuento' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Verificar que el usuario es admin
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { code, type, value, maxUsesPerUser = 1, expiresAt } = body;

  // Validaciones
  if (!code || !type || !value) {
    return NextResponse.json(
      { error: 'Campos requeridos: code, type, value' },
      { status: 400 }
    );
  }

  if (!['percentage', 'fixed'].includes(type)) {
    return NextResponse.json(
      { error: 'El tipo debe ser "percentage" o "fixed"' },
      { status: 400 }
    );
  }

  if (value <= 0) {
    return NextResponse.json(
      { error: 'El valor debe ser mayor a 0' },
      { status: 400 }
    );
  }

  if (type === 'percentage' && value > 100) {
    return NextResponse.json(
      { error: 'El porcentaje no puede ser mayor a 100' },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();

  try {
    const { data: newCode, error } = await supabaseAdmin
      .from('discount_codes')
      .insert({
        code: code.toUpperCase(),
        type,
        value,
        max_uses_per_user: maxUsesPerUser,
        expires_at: expiresAt || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Ya existe un código con ese nombre' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ code: newCode }, { status: 201 });

  } catch (error) {
    console.error('Error creating discount code:', error);
    return NextResponse.json(
      { error: 'Error al crear código de descuento' },
      { status: 500 }
    );
  }
}