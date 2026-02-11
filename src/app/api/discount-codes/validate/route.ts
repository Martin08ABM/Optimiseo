import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { validateDiscountCode } from '@/src/lib/admin/discounts';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { code, price } = body;

  if (!code || !price) {
    return NextResponse.json(
      { error: 'Campos requeridos: code, price' },
      { status: 400 }
    );
  }

  try {
    const validation = await validateDiscountCode(code, user.id, price);

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      discountCode: validation.discount,
      discountAmount: validation.discountAmount,
      finalPrice: price - (validation.discountAmount || 0),
    });

  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { error: 'Error al validar código de descuento' },
      { status: 500 }
    );
  }
}