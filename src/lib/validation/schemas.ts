import { z } from 'zod';

// Validation schemas for API inputs

export const AnalysisRequestSchema = z.object({
  prompt: z.string()
    .min(1, 'El texto o URL no puede estar vacío')
    .max(50000, 'El texto no puede exceder 50000 caracteres')
    .trim(),
  context: z.object({
    selection: z.string().optional(),
    url: z.string().url().optional().or(z.literal('')),
    targetKeyword: z.string().max(100).optional(),
    competitorUrls: z.array(z.string()).max(2).optional(),
    directText: z.string().max(50000).optional(),
  }).optional().default({}),
});

export const URLSchema = z.string()
  .url('Debe ser una URL válida')
  .max(2048, 'URL demasiado larga')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    'Solo se permiten URLs HTTP y HTTPS'
  );

export const RegisterSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email demasiado corto')
    .max(255, 'Email demasiado largo')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Debe contener al menos un símbolo especial'),
  fullName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim()
    .optional(),
});

export const LoginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'La contraseña es requerida'),
});

export const PasswordResetSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),
});

export const MFASetupSchema = z.object({
  code: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código debe contener solo números'),
});

export const MFAVerifySchema = z.object({
  code: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código debe contener solo números'),
  trustDevice: z.boolean().optional().default(false),
});

export const SubscriptionCheckoutSchema = z.object({
  planId: z.enum(['pro'], 'Plan inválido'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const DiscountCodeSchema = z.object({
  code: z.string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres')
    .trim()
    .regex(/^[A-Z0-9-_]+$/i, 'El código solo puede contener letras, números, guiones y guiones bajos'),
  discountPercent: z.number()
    .int('El descuento debe ser un número entero')
    .min(5, 'El descuento mínimo es 5%')
    .max(100, 'El descuento máximo es 100%'),
  maxUses: z.number()
    .int('El máximo de usos debe ser un número entero')
    .min(1, 'Debe permitir al menos 1 uso')
    .optional(),
  expiresAt: z.string()
    .datetime('Fecha inválida')
    .optional(),
});

export const AdminUserUpdateSchema = z.object({
  planId: z.enum(['free', 'pro'], 'Plan inválido'),
  status: z.enum(['active', 'canceled', 'past_due'], 'Estado inválido').optional(),
});

// TypeScript types
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type URLInput = z.infer<typeof URLSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>;
export type MFASetupInput = z.infer<typeof MFASetupSchema>;
export type MFAVerifyInput = z.infer<typeof MFAVerifySchema>;
export type SubscriptionCheckoutInput = z.infer<typeof SubscriptionCheckoutSchema>;
export type DiscountCodeInput = z.infer<typeof DiscountCodeSchema>;
export type AdminUserUpdateInput = z.infer<typeof AdminUserUpdateSchema>;

// Helper function to validate and get error messages
export function getValidationErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: false; errors: Record<string, string> } | { success: true; data: T } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((error) => {
      const field = error.path.join('.');
      errors[field] = error.message;
    });
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}