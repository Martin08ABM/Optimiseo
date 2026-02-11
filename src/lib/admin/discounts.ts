import { createAdminClient } from '@/src/lib/supabase/admin';

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  is_active: boolean;
  max_uses_per_user: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscountValidation {
  valid: boolean;
  discount?: DiscountCode;
  error?: string;
  discountAmount?: number;
}

/**
 * Valida un código de descuento para un usuario
 */
export async function validateDiscountCode(
  code: string,
  userId: string,
  originalPrice: number
): Promise<DiscountValidation> {
  const supabaseAdmin = createAdminClient();

  // Buscar el código
  const { data: discount, error: discountError } = await supabaseAdmin
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (discountError || !discount) {
    return { valid: false, error: 'Código de descuento inválido' };
  }

  // Verificar expiración
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return { valid: false, error: 'Este código ha expirado' };
  }

  // Verificar si el usuario ya lo usó
  const { count } = await supabaseAdmin
    .from('discount_code_usage')
    .select('*', { count: 'exact', head: true })
    .eq('code_id', discount.id)
    .eq('user_id', userId);

  if (count && count >= discount.max_uses_per_user) {
    return { valid: false, error: 'Ya has usado este código de descuento' };
  }

  // Calcular descuento
  let discountAmount = 0;
  if (discount.type === 'percentage') {
    discountAmount = (originalPrice * discount.value) / 100;
  } else {
    discountAmount = discount.value;
  }

  // Asegurar que el descuento no sea mayor al precio
  discountAmount = Math.min(discountAmount, originalPrice);

  return {
    valid: true,
    discount: discount as DiscountCode,
    discountAmount: Math.round(discountAmount * 100) / 100, // Redondear a 2 decimales
  };
}

/**
 * Registra el uso de un código de descuento
 */
export async function recordDiscountUsage(
  codeId: string,
  userId: string,
  discountAmount: number,
  stripeCustomerId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from('discount_code_usage')
    .insert({
      code_id: codeId,
      user_id: userId,
      discount_amount: discountAmount,
      stripe_customer_id: stripeCustomerId,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Calcula el precio final después de aplicar descuento
 */
export function calculateFinalPrice(originalPrice: number, discountAmount: number): number {
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  return Math.round(finalPrice * 100) / 100;
}