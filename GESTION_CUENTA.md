# Gestión de Cuenta - Documentación

## 🎯 Funcionalidades implementadas

Se han añadido tres nuevas funcionalidades de gestión de cuenta en el dashboard:

### 1. **Cancelar Suscripción Pro**
- Solo visible para usuarios con plan Pro activo
- Cancela la suscripción al final del período de facturación actual
- El usuario mantiene acceso Pro hasta el final del período pagado
- Después volverá automáticamente al plan Free

### 2. **Cerrar Sesión**
- Cierra la sesión del usuario actual
- Redirige a la página principal
- Disponible para todos los usuarios

### 3. **Eliminar Cuenta Permanentemente**
- Elimina permanentemente la cuenta y todos los datos del usuario
- **ADVERTENCIA**: Esta acción es irreversible
- Requiere que el usuario NO tenga una suscripción Pro activa
- Elimina:
  - Cuenta de usuario
  - Historial de análisis
  - Información de suscripción
  - Registros de pagos

---

## 🔧 Configuración necesaria

### Service Role Key de Supabase

Para que la funcionalidad de "Eliminar cuenta" funcione, necesitas configurar la **Service Role Key** de Supabase.

#### ¿Qué es la Service Role Key?

Es una clave especial que tiene privilegios de **administrador** en Supabase. Permite realizar operaciones que normalmente requieren permisos elevados, como eliminar usuarios.

⚠️ **IMPORTANTE**: Esta clave tiene acceso completo a tu base de datos. **NUNCA** la expongas en el cliente o la subas a git.

#### ¿Cómo obtenerla?

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** (Configuración) → **API**
3. En la sección **Project API keys**, encontrarás:
   - `anon` / `public` - Ya la tienes como `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` - **Esta es la que necesitas**
4. Haz clic en el ícono del ojo para revelar la clave
5. Cópiala y añádela a tu `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Seguridad

- ✅ Úsala solo en el servidor (API routes, Server Actions)
- ✅ Mantenla en `.env.local` (ya está en `.gitignore`)
- ❌ NUNCA la uses en componentes cliente
- ❌ NUNCA la expongas en variables que empiecen con `NEXT_PUBLIC_`

---

## 📁 Archivos creados

### Server Actions
```
src/actions/account/
├── logout.ts                    # Cerrar sesión
├── delete-account.ts           # Eliminar cuenta (llama a API)
└── cancel-subscription.ts      # Cancelar suscripción Pro
```

### API Routes
```
src/app/api/account/delete/route.ts  # Endpoint para eliminar cuenta (usa Service Role)
```

### Componentes
```
src/components/dashboard/AccountActions.tsx  # Botones de gestión de cuenta
```

### Modificados
```
src/components/dashboard/MainDashboard.tsx   # Añadida sección "Gestión de cuenta"
```

---

## 🎨 Interfaz de usuario

### Nueva sección en el Dashboard

Se ha añadido una tercera sección en el dashboard llamada **"Gestión de cuenta"** que incluye:

#### Para usuarios Free:
- ⚪ Cerrar sesión (botón azul)
- 🔴 Eliminar cuenta permanentemente (botón rojo)

#### Para usuarios Pro:
- 🟠 Cancelar suscripción Pro (botón naranja)
- ⚪ Cerrar sesión (botón azul)
- 🔴 Eliminar cuenta permanentemente (botón rojo)

### Modales de confirmación

**Cancelar suscripción:**
- Explica que la cancelación es al final del período
- Muestra dos opciones: "No, mantener Pro" y "Sí, cancelar"
- Muestra mensaje de éxito con la fecha de cancelación

**Eliminar cuenta:**
- Advertencia en rojo sobre que es irreversible
- Lista de lo que se eliminará
- Advertencia especial si tiene suscripción Pro activa
- Requiere doble confirmación

---

## 🔄 Flujo de eliminación de cuenta

```
1. Usuario hace clic en "Eliminar cuenta permanentemente"
   ↓
2. Se muestra modal de confirmación con advertencias
   ↓
3. Usuario confirma la eliminación
   ↓
4. Componente AccountActions llama a deleteAccountAction()
   ↓
5. Server Action llama a /api/account/delete
   ↓
6. API route verifica:
   - Usuario autenticado ✓
   - NO tiene suscripción Pro activa ✓
   ↓
7. Elimina datos en orden:
   - Análisis del usuario
   - Registros de pagos
   - Suscripción
   - Cuenta de usuario (usando Service Role)
   ↓
8. Cierra sesión y redirige a home
```

---

## 🔒 Seguridad

### Validaciones implementadas

1. **Cancelar suscripción:**
   - Solo usuarios con plan Pro pueden cancelar
   - Verifica que existe suscripción en Stripe
   - Usa API de Stripe para cancelación segura

2. **Eliminar cuenta:**
   - Verifica autenticación del usuario
   - Bloquea eliminación si tiene Pro activo
   - Usa Service Role solo en el servidor
   - Elimina datos en cascada correctamente

3. **Cerrar sesión:**
   - Invalida la sesión en Supabase
   - Limpia cookies de autenticación

---

## 🧪 Cómo probar

### Probar cancelación de suscripción (requiere plan Pro):

1. Suscríbete al plan Pro desde `/pricing`
2. Ve a `/dashboard`
3. En "Gestión de cuenta", haz clic en "Cancelar suscripción Pro"
4. Confirma la cancelación
5. Verifica que aparece el mensaje de cuándo se cancelará
6. Ve al portal de Stripe para confirmar la cancelación

### Probar cerrar sesión:

1. Inicia sesión en la aplicación
2. Ve a `/dashboard`
3. Haz clic en "Cerrar sesión"
4. Verifica que te redirige a home y ya no estás autenticado

### Probar eliminación de cuenta:

⚠️ **PRECAUCIÓN**: Usa una cuenta de prueba, esto es irreversible

1. Crea una cuenta de prueba
2. Si tiene plan Pro, cancélalo primero
3. Ve a `/dashboard`
4. Haz clic en "Eliminar cuenta permanentemente"
5. Lee las advertencias y confirma
6. Verifica que te redirige a home
7. Intenta iniciar sesión con esa cuenta → debe fallar

---

## 🐛 Troubleshooting

### "Error al eliminar la cuenta"

**Causa**: No está configurada la `SUPABASE_SERVICE_ROLE_KEY`

**Solución**:
1. Ve a tu Supabase Dashboard → Settings → API
2. Copia la Service Role Key
3. Añádela a `.env.local`
4. Reinicia el servidor de desarrollo

### "Debes cancelar tu suscripción Pro antes de eliminar tu cuenta"

**Causa**: Tienes una suscripción Pro activa

**Solución**:
1. Ve al dashboard
2. Haz clic en "Cancelar suscripción Pro" o "Gestionar suscripción"
3. Cancela desde el portal de Stripe
4. Espera a que finalice el período de facturación
5. Ahora podrás eliminar la cuenta

### La cancelación de suscripción no funciona

**Causa**: Error con Stripe o configuración incorrecta

**Solución**:
1. Verifica que `STRIPE_SECRET_KEY` esté configurada
2. Revisa los logs del servidor para errores
3. Como alternativa, usa el botón "Gestionar suscripción" que te lleva al portal de Stripe

---

## 📊 Consideraciones de producción

### Antes de ir a producción:

1. **Emails de confirmación**: Considera enviar emails cuando:
   - Se cancela una suscripción
   - Se elimina una cuenta
   - Se cierra sesión desde un nuevo dispositivo

2. **Período de gracia**: Podrías implementar:
   - 30 días de "cuenta desactivada" antes de eliminar permanentemente
   - Opción de recuperar la cuenta durante ese período

3. **Backup de datos**: Considera:
   - Exportar datos del usuario antes de eliminar
   - Ofrecer descarga de historial de análisis

4. **Auditoría**: Implementar logs de:
   - Quién eliminó su cuenta (para estadísticas)
   - Cuándo se cancelaron suscripciones
   - Razones de cancelación (opcional)

---

## ✨ Mejoras futuras sugeridas

- [ ] Email de confirmación al cancelar suscripción
- [ ] Email de confirmación al eliminar cuenta
- [ ] Exportar datos antes de eliminar
- [ ] Período de gracia de 30 días
- [ ] Encuesta de cancelación (¿por qué te vas?)
- [ ] Opción de pausar suscripción en lugar de cancelar
- [ ] Historial de acciones de cuenta en el dashboard

---

**¡Las funcionalidades de gestión de cuenta están listas!** 🎉

Solo asegúrate de configurar la `SUPABASE_SERVICE_ROLE_KEY` en tu `.env.local` para que la eliminación de cuenta funcione correctamente.
