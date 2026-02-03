# Autenticación Multi-Factor (MFA) con Supabase

Este proyecto implementa autenticación de dos factores (2FA) usando TOTP (Time-based One-Time Password) con Supabase Auth.

## Características

- ✅ Enrollment de MFA con código QR
- ✅ Verificación TOTP con apps como Google Authenticator, Authy, 1Password
- ✅ Gestión de MFA desde el perfil de usuario
- ✅ Protección automática de rutas con middleware
- ✅ Flujo completo de login con MFA

## Configuración en Supabase

MFA está habilitado por defecto en todos los proyectos de Supabase. No requiere configuración adicional.

## Estructura de archivos

```
src/
├── actions/auth/
│   ├── mfa-enroll.ts       # Server action para enrollar MFA
│   ├── mfa-verify.ts       # Server action para verificar código TOTP
│   └── mfa-unenroll.ts     # Server action para desactivar MFA
├── components/
│   ├── MFAEnrollDialog.tsx # Modal para configurar MFA con QR
│   ├── MFAVerifyDialog.tsx # Modal para verificar código en login
│   └── MFASettings.tsx     # Componente para settings de usuario
└── app/auth/
    └── mfa-verify/
        └── page.tsx        # Página de verificación MFA post-login
```

## Uso

### 1. Habilitar MFA para un usuario

Importa y usa el componente `MFASettings` en la página de perfil del usuario:

```tsx
import { MFASettings } from '@/src/components/MFASettings'

export default function ProfilePage() {
  return (
    <div>
      <h1>Mi Perfil</h1>
      <MFASettings />
    </div>
  )
}
```

### 2. Flujo de enrollment

1. El usuario hace clic en "Activar 2FA"
2. Se muestra un código QR generado por `supabase.auth.mfa.enroll()`
3. El usuario escanea el QR con su app de autenticación
4. Ingresa el código de 6 dígitos para verificar
5. MFA queda activado para su cuenta

### 3. Flujo de login con MFA

1. Usuario ingresa email y contraseña
2. Si tiene MFA habilitado, es redirigido a `/auth/mfa-verify`
3. Ingresa el código de su app de autenticación
4. Al verificar correctamente, accede al dashboard

### 4. Protección de rutas

El middleware automáticamente verifica el AAL (Authenticator Assurance Level):

- Si `currentLevel` es `aal1` pero `nextLevel` es `aal2`, redirige a `/auth/mfa-verify`
- Esto protege todas las rutas bajo `/dashboard`

## APIs de Supabase utilizadas

### Enrollment
```typescript
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
})
// Retorna: { id, totp: { qr_code, secret, uri } }
```

### Challenge
```typescript
const { data, error } = await supabase.auth.mfa.challenge({ 
  factorId 
})
// Retorna: { id, expires_at }
```

### Verify
```typescript
const { data, error } = await supabase.auth.mfa.verify({
  factorId,
  challengeId,
  code: '123456',
})
```

### Check AAL
```typescript
const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
// Retorna: { currentLevel: 'aal1' | 'aal2', nextLevel: 'aal1' | 'aal2' }
```

### List Factors
```typescript
const { data, error } = await supabase.auth.mfa.listFactors()
// Retorna: { totp: [...], phone: [...] }
```

### Unenroll
```typescript
const { data, error } = await supabase.auth.mfa.unenroll({ 
  factorId 
})
```

## Niveles de Autenticación (AAL)

| Current Level | Next Level | Significado |
|--------------|------------|-------------|
| `aal1` | `aal1` | Usuario no tiene MFA configurado |
| `aal1` | `aal2` | Usuario tiene MFA pero no lo ha verificado en esta sesión |
| `aal2` | `aal2` | Usuario ha verificado MFA correctamente |
| `aal2` | `aal1` | Usuario desactivó MFA (JWT obsoleto) |

## Aplicaciones de autenticación compatibles

- Google Authenticator (iOS/Android)
- Microsoft Authenticator
- Authy
- 1Password
- Bitwarden
- LastPass Authenticator
- Cualquier app compatible con TOTP

## Seguridad

- Los códigos TOTP son válidos por 30 segundos
- El secret nunca se almacena en el cliente
- La verificación se hace server-side
- El middleware protege automáticamente las rutas
- Rate limiting aplicado en login

## Desactivar MFA

Los usuarios pueden desactivar MFA desde su perfil:

1. Ir a configuración de perfil
2. Sección "Autenticación de Dos Factores"
3. Clic en "Desactivar 2FA"
4. Confirmar la acción

## Troubleshooting

### El código QR no se muestra
- Verifica que el usuario esté autenticado
- Revisa la consola del navegador para errores
- Asegúrate de que Supabase esté configurado correctamente

### El código TOTP no funciona
- Verifica que la hora del dispositivo esté sincronizada
- Los códigos expiran cada 30 segundos
- Asegúrate de ingresar el código actual, no uno anterior

### Usuario bloqueado en /auth/mfa-verify
- Verifica que el factor MFA esté correctamente enrollado
- Revisa los logs de Supabase Auth
- Como último recurso, desactiva MFA desde el dashboard de Supabase

## Referencias

- [Documentación oficial de Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp)
- [RFC 6238 - TOTP](https://tools.ietf.org/html/rfc6238)
