import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/src/lib/admin/auth';
import { createAdminClient } from '@/src/lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  // Verificar que el usuario es admin
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const body = await request.json();
  const { isActive, expiresAt, value, maxUsesPerUser } = body;

  const supabaseAdmin = createAdminClient();

  try {
    // Construir el objeto de actualización
    const updates: any = { updated_at: new Date().toISOString() };

    if (typeof isActive === 'boolean') {
      updates.is_active = isActive;
    }

    if (expiresAt !== undefined) {
      updates.expires_at = expiresAt;
    }

    if (value !== undefined && value > 0) {
      updates.value = value;
    }

    if (maxUsesPerUser !== undefined && maxUsesPerUser > 0) {
      updates.max_uses_per_user = maxUsesPerUser;
    }

    const { data: updatedCode, error } = await supabaseAdmin
      .from('discount_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedCode) {
      return NextResponse.json(
        { error: 'Código no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ code: updatedCode });

  } catch (error) {
    console.error('Error updating discount code:', error);
    return NextResponse.json(
      { error: 'Error al actualizar código de descuento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  // Verificar que el usuario es admin
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const supabaseAdmin = createAdminClient();

  try {
    const { error } = await supabaseAdmin
      .from('discount_codes')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting discount code:', error);
    return NextResponse.json(
      { error: 'Error al eliminar código de descuento' },
      { status: 500 }
    );
  }
}