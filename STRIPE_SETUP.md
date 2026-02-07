# Configuración de Stripe para OptimiSEO

Esta guía te ayudará a configurar Stripe para el sistema de suscripciones de OptimiSEO.

## 1. Crear una cuenta en Stripe

1. Ve a [https://stripe.com](https://stripe.com) y crea una cuenta
2. Activa el modo de prueba (Test mode) en el dashboard

## 2. Obtener las API Keys

1. Ve a **Developers** > **API Keys**
2. Copia la **Publishable key** y la **Secret key**
3. Añádelas a tu archivo `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 3. Crear el producto y precio en Stripe

1. Ve a **Products** > **Add product**
2. Configura el producto:
   - **Name**: Plan Pro OptimiSEO
   - **Description**: Plan profesional con 100 análisis diarios
   - **Pricing model**: Recurring
   - **Price**: 12.00 EUR
   - **Billing period**: Monthly
3. Haz clic en **Save product**
4. Copia el **Price ID** (empieza con `price_...`)
5. Añádelo a tu `.env.local`:

```env
STRIPE_PRO_PRICE_ID=price_...
```

## 4. Configurar el Webhook

1. Ve a **Developers** > **Webhooks**
2. Haz clic en **Add endpoint**
3. Configura el endpoint:
   - **Endpoint URL**: `https://tu-dominio.com/api/webhooks/stripe`
     - Para desarrollo local, usa [Stripe CLI](#5-testing-local-con-stripe-cli)
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Copia el **Signing secret** (empieza con `whsec_...`)
5. Añádelo a tu `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 5. Testing local con Stripe CLI

Para probar webhooks en desarrollo local:

### Instalar Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (con Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
# Descarga desde https://github.com/stripe/stripe-cli/releases/latest
```

### Autenticarse

```bash
stripe login
```

### Escuchar webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Esto te dará un webhook secret temporal para testing. Cópialo a `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Probar eventos

```bash
# Simular un checkout exitoso
stripe trigger checkout.session.completed

# Simular una actualización de suscripción
stripe trigger customer.subscription.updated

# Simular una cancelación
stripe trigger customer.subscription.deleted
```

## 6. Migración de base de datos

Ejecuta la migración de Supabase para crear las tablas necesarias:

```bash
# Asegúrate de tener Supabase CLI instalado
npm install -g supabase

# Ejecuta las migraciones
supabase db push
```

O puedes ejecutar manualmente el archivo SQL en el dashboard de Supabase:
- Ve a **SQL Editor** en tu proyecto de Supabase
- Copia y pega el contenido de `supabase/migrations/20260205_subscriptions.sql`
- Ejecuta la query

## 7. Variables de entorno completas

Tu archivo `.env.local` debería verse así:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Anthropic AI
ANTHROPIC_API_KEY=tu_anthropic_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 8. Instalar dependencias

```bash
npm install stripe
```

## 9. Probar el flujo completo

1. Inicia la aplicación: `npm run dev`
2. Regístrate con un usuario nuevo
3. Ve al dashboard y haz clic en "Mejorar a Pro"
4. Usa las tarjetas de prueba de Stripe:
   - **Éxito**: `4242 4242 4242 4242`
   - **Fallo**: `4000 0000 0000 0002`
   - Fecha de expiración: cualquier fecha futura
   - CVC: cualquier 3 dígitos
   - Código postal: cualquier valor

## 10. Ir a producción

Cuando estés listo para producción:

1. Cambia a las claves de producción en Stripe
2. Configura el webhook de producción con la URL real
3. Actualiza las variables de entorno en tu hosting
4. Activa el modo de producción en Stripe

## Estructura de la base de datos

El sistema crea las siguientes tablas:

- `plans`: Planes disponibles (free, pro)
- `subscriptions`: Suscripciones de usuarios
- `analyses`: Historial de análisis SEO
- `payments`: Registro de pagos

## Funcionalidades implementadas

✅ Plan Free: 5 análisis diarios
✅ Plan Pro: 100 análisis diarios (12€/mes)
✅ Tracking de uso diario
✅ Portal de gestión de suscripciones
✅ Webhooks para actualización automática
✅ Historial de análisis (solo Pro)
✅ Auto-asignación de plan Free en registro

## Próximos pasos a implementar

- [ ] Actualizar Stripe Price ID en producción
- [ ] Configurar emails de confirmación
- [ ] Añadir exportación de análisis (Pro)
- [ ] Implementar comparación de revisiones (Pro)
- [ ] Dashboard de administración
- [ ] Métricas y analytics

## Soporte

Si tienes problemas con la configuración de Stripe:
- [Documentación de Stripe](https://stripe.com/docs)
- [Testing con Stripe](https://stripe.com/docs/testing)
- [Webhooks](https://stripe.com/docs/webhooks)
