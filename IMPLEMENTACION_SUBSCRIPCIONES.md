# Implementación del Sistema de Suscripciones - OptimiSEO

## ✅ Lo que se ha implementado

### 1. **Base de Datos (Supabase)**
- ✅ Migración completa con tablas:
  - `plans`: Definición de planes (Free y Pro)
  - `subscriptions`: Suscripciones de usuarios
  - `analyses`: Historial de análisis SEO con tracking de uso
  - `payments`: Registro de transacciones
- ✅ Row Level Security (RLS) configurado
- ✅ Trigger automático para asignar plan Free al registrarse
- ✅ Índices para optimización de consultas

### 2. **Sistema de Planes**

#### **Plan Free**
- 5 análisis SEO diarios
- Análisis de legibilidad
- Análisis de repetición de palabras
- Evaluación de coherencia
- Sin historial
- Sin exportación

#### **Plan Pro (12€/mes)**
- 100 análisis diarios
- Todos los tipos de análisis
- Historial de análisis (30 días)
- Comparación de revisiones
- Exportación de resultados (PDF/JSON)
- Soporte prioritario
- Acceso anticipado a nuevas funciones

### 3. **Integración con Stripe**
- ✅ Configuración de Stripe SDK
- ✅ Creación de checkout sessions
- ✅ Portal de gestión de suscripciones
- ✅ Webhooks implementados:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 4. **API Routes**
- ✅ `/api/subscription/checkout` - Crear sesión de pago
- ✅ `/api/subscription/portal` - Portal de facturación
- ✅ `/api/subscription/status` - Estado de suscripción
- ✅ `/api/webhooks/stripe` - Webhooks de Stripe

### 5. **Sistema de Límites**
- ✅ Verificación de límites antes de cada análisis
- ✅ Tracking automático de análisis realizados
- ✅ Contador de uso diario
- ✅ Reinicio automático a medianoche
- ✅ Modificación de `/api/ai/claude` para verificar límites

### 6. **Componentes UI**
- ✅ `SubscriptionCard` - Muestra plan actual y uso
- ✅ `LimitReachedModal` - Modal al alcanzar límite
- ✅ Página de pricing (`/pricing`)

### 7. **TypeScript Types**
- ✅ Tipos completos para suscripciones
- ✅ Tipos para análisis y pagos
- ✅ Interfaces para datos de usuario

### 8. **Utilidades**
- ✅ `getUserSubscription()` - Obtener suscripción del usuario
- ✅ `getDailyUsage()` - Calcular uso diario
- ✅ `canPerformAnalysis()` - Verificar si puede analizar
- ✅ `trackAnalysis()` - Registrar análisis
- ✅ `getAnalysisHistory()` - Historial (solo Pro)

---

## 🚀 Próximos pasos (lo que TÚ debes hacer)

### 1. **Configurar Stripe** (OBLIGATORIO)

Sigue la guía completa en `STRIPE_SETUP.md`. Resumen:

1. Crear cuenta en Stripe
2. Obtener API Keys (Test mode primero)
3. Crear producto "Plan Pro" a 12€/mes
4. Obtener Price ID
5. Configurar webhook
6. Añadir variables de entorno a `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### 2. **Ejecutar la migración de base de datos**

```bash
# Opción 1: Con Supabase CLI
supabase db push

# Opción 2: Manualmente en Supabase Dashboard
# 1. Ve a SQL Editor
# 2. Copia el contenido de supabase/migrations/20260205_subscriptions.sql
# 3. Ejecuta
```

### 3. **Probar localmente**

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escuchar webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# En otra terminal, iniciar app
pnpm dev
```

### 4. **Integrar componentes en el Dashboard**

Necesitas añadir el `SubscriptionCard` a tu dashboard. Edita `/src/app/dashboard/page.tsx`:

```tsx
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Dashboard</h1>

      {/* Añadir tarjeta de suscripción */}
      <SubscriptionCard />

      {/* Resto de tu contenido */}
    </div>
  );
}
```

### 5. **Añadir modal de límite alcanzado**

En tu componente Hero o donde se realizan los análisis, importa y usa el modal:

```tsx
import { LimitReachedModal } from '@/components/dashboard/LimitReachedModal';
import { useState } from 'react';

// En tu componente:
const [showLimitModal, setShowLimitModal] = useState(false);

// Al hacer análisis, si la API devuelve 429:
try {
  const response = await fetch('/api/ai/claude', {
    method: 'POST',
    body: JSON.stringify({ prompt, context })
  });

  if (response.status === 429) {
    const data = await response.json();
    setShowLimitModal(true);
    // Mostrar error
  }
} catch (error) {
  // ...
}

// En el JSX:
<LimitReachedModal
  isOpen={showLimitModal}
  onClose={() => setShowLimitModal(false)}
/>
```

### 6. **Actualizar navegación**

El link a `/pricing` ya existe en tu Header, pero verifica que esté bien configurado.

### 7. **Configurar variables de entorno en producción**

Cuando despliegues a producción (Vercel, etc.):

1. Cambia a claves de producción de Stripe
2. Configura el webhook de producción con la URL real
3. Añade todas las variables de entorno en tu hosting

---

## 📁 Archivos creados/modificados

### **Nuevos archivos:**
```
supabase/migrations/20260205_subscriptions.sql
src/types/subscription.ts
src/lib/subscription/utils.ts
src/lib/stripe/config.ts
src/lib/stripe/subscription.ts
src/app/api/webhooks/stripe/route.ts
src/app/api/subscription/checkout/route.ts
src/app/api/subscription/portal/route.ts
src/app/api/subscription/status/route.ts
src/components/dashboard/SubscriptionCard.tsx
src/components/dashboard/LimitReachedModal.tsx
src/app/pricing/page.tsx
.env.example
STRIPE_SETUP.md
IMPLEMENTACION_SUBSCRIPCIONES.md
```

### **Archivos modificados:**
```
src/app/api/ai/claude/route.ts - Añadida verificación de límites y tracking
package.json - Añadida dependencia de Stripe
```

---

## 🧪 Cómo probar

### **Test del flujo completo:**

1. **Registro de nuevo usuario:**
   - Regístrate → Automáticamente se asigna plan Free
   - Ve al dashboard → Debería mostrar "Plan Free" con 5/5 análisis disponibles

2. **Realizar análisis:**
   - Haz un análisis SEO
   - Verifica que el contador baje a 4/5
   - Haz 5 análisis en total
   - El sexto intento debería mostrar el modal de límite alcanzado

3. **Upgrade a Pro:**
   - Haz clic en "Mejorar a Pro"
   - Completa el checkout en Stripe (usa tarjeta de prueba: 4242 4242 4242 4242)
   - Verifica que te redirija al dashboard
   - El plan debería ser "Plan Pro" con 100 análisis diarios

4. **Portal de facturación:**
   - Como usuario Pro, haz clic en "Gestionar suscripción"
   - Deberías poder ver/cancelar tu suscripción

5. **Webhooks:**
   - Con Stripe CLI escuchando, actualiza/cancela la suscripción desde el portal
   - Verifica que la base de datos se actualice correctamente

### **Tarjetas de prueba de Stripe:**
- ✅ Éxito: `4242 4242 4242 4242`
- ❌ Fallo: `4000 0000 0000 0002`
- 🔒 Requiere autenticación: `4000 0025 0000 3155`

---

## 🔧 Configuración de webhooks en local

Para que los webhooks funcionen en desarrollo local:

```bash
# Terminal 1: Escuchar webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copia el webhook secret que aparece (whsec_...)
# Añádelo a .env.local

# Terminal 2: Iniciar app
pnpm dev

# Terminal 3: Probar eventos
stripe trigger checkout.session.completed
```

---

## 🎨 Personalización futura

Puedes personalizar fácilmente:

1. **Añadir más planes:**
   - Edita la migración SQL para añadir más planes
   - Actualiza los componentes UI

2. **Cambiar límites:**
   - Edita `daily_analysis_limit` en la tabla `plans`

3. **Añadir features:**
   - Edita el campo `features` (JSON) en cada plan

4. **Cambiar precio:**
   - Actualiza en Stripe Dashboard
   - Actualiza `STRIPE_PRO_PRICE_ID`

---

## 📊 Estructura de la base de datos

```sql
plans
├── id (free, pro)
├── name
├── description
├── price_monthly
├── stripe_price_id
├── daily_analysis_limit
└── features (JSONB)

subscriptions
├── id
├── user_id
├── plan_id
├── stripe_customer_id
├── stripe_subscription_id
├── status
├── current_period_start
├── current_period_end
└── cancel_at_period_end

analyses
├── id
├── user_id
├── url
├── analysis_type
├── result (JSONB)
├── scraped_data (JSONB)
├── plan_used
└── created_at

payments
├── id
├── subscription_id
├── stripe_payment_intent_id
├── amount
├── currency
└── status
```

---

## ⚠️ Notas importantes

1. **Seguridad:**
   - NUNCA subas `.env.local` a git
   - Las claves de Stripe son sensibles
   - Los webhooks verifican la firma

2. **Testing:**
   - Prueba primero en modo test de Stripe
   - Usa las tarjetas de prueba
   - Verifica los webhooks con Stripe CLI

3. **Producción:**
   - Cambia a claves de producción
   - Configura webhook en producción
   - Monitorea los logs de Stripe

4. **Límites diarios:**
   - Se reinician a medianoche (hora del servidor)
   - Son por usuario, no por suscripción
   - El historial se guarda en `analyses`

---

## 🐛 Troubleshooting

### **"No subscription found"**
- Verifica que se ejecutó la migración
- Verifica que el trigger automático funciona
- Crea manualmente una suscripción free para el usuario

### **"Unauthorized" en análisis**
- Verifica que el usuario esté autenticado
- Verifica cookies de Supabase

### **Webhooks no funcionan**
- Verifica que Stripe CLI esté escuchando
- Verifica el `STRIPE_WEBHOOK_SECRET`
- Revisa logs en Stripe Dashboard

### **Checkout no redirige**
- Verifica `STRIPE_PRO_PRICE_ID`
- Verifica `NEXT_PUBLIC_APP_URL`
- Revisa logs del navegador

---

## 📞 Soporte

Si tienes problemas:
1. Revisa `STRIPE_SETUP.md`
2. Consulta [Stripe Docs](https://stripe.com/docs)
3. Revisa logs en Stripe Dashboard
4. Verifica variables de entorno

---

## ✨ Próximas mejoras sugeridas

- [ ] Emails de confirmación (Resend/SendGrid)
- [ ] Dashboard de administración
- [ ] Métricas de uso por usuario
- [ ] Exportación a PDF/JSON
- [ ] Comparación de revisiones
- [ ] Plan Enterprise
- [ ] Descuentos y cupones
- [ ] Facturación anual
- [ ] API pública para partners

---

**¡El sistema base de suscripciones está completo!** 🎉

Solo necesitas configurar Stripe y ejecutar la migración para que todo funcione.
