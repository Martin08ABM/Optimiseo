import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, setUserBlockedStatus } from '@/src/lib/admin/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
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

  const { id: userId } = await context.params;
  const body = await request.json();
  const { isBlocked, reason } = body;

  if (typeof isBlocked !== 'boolean') {
    return NextResponse.json(
      { error: 'Campo isBlocked requerido' },
      { status: 400 }
    );
  }

  // No permitir que el admin se bloquee a sí mismo
  if (userId === admin.id && isBlocked) {
    return NextResponse.json(
      { error: 'No puedes bloquearte a ti mismo' },
      { status: 400 }
    );
  }

  try {
    const result = await setUserBlockedStatus(userId, isBlocked, reason);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isBlocked ? 'Usuario bloqueado correctamente' : 'Usuario desbloqueado correctamente',
    });

  } catch (error) {
    console.error('Error blocking/unblocking user:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}