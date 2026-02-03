# 🚀 OptimiSEO

**OptimiSEO** es un analizador de SEO inteligente que utiliza IA para evaluar y optimizar el contenido web. La aplicación analiza textos y títulos, proporcionando métricas detalladas sobre legibilidad, repetición de palabras y coherencia del contenido.

## 📋 Descripción del Proyecto

OptimiSEO es una herramienta diseñada para ayudar a creadores de contenido, bloggers y profesionales del marketing digital a mejorar la calidad SEO de sus publicaciones. Mediante el uso de inteligencia artificial, la aplicación:

- ✅ Analiza la legibilidad del contenido
- ✅ Detecta repetición excesiva de palabras
- ✅ Evalúa la coherencia entre título y contenido
- ✅ Sugiere títulos alternativos optimizados para SEO

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 16.1.1** - Framework de React con renderizado del lado del servidor
- **React 19.2.3** - Biblioteca de JavaScript para construir interfaces de usuario
- **TypeScript 5** - Superset tipado de JavaScript
- **Tailwind CSS 4.1.18** - Framework de CSS utility-first

### Backend & Autenticación
- **Supabase** - Backend as a Service (BaaS)
  - Autenticación de usuarios
  - Base de datos PostgreSQL
  - Almacenamiento de archivos (avatares)
  - Gestión de roles de usuario

### IA & Análisis
- **Anthropic Claude Sonnet 4.5** - Modelo de IA para análisis SEO
  - Web scraping automático con cheerio
  - Análisis de legibilidad de contenido
  - Detección de repetición de palabras
  - Evaluación de coherencia del contenido
  - Extracción de keywords y metadatos

### Herramientas de Desarrollo
- **ESLint 9** - Linter para mantener código limpio
- **PostCSS 8.5.6** - Procesador de CSS

## 📁 Estructura del Proyecto

```
optimiseo/
├── src/
│   ├── actions/                  # Server Actions
│   │   └── auth/                # Acciones de autenticación
│   │       ├── login.ts         # Lógica de inicio de sesión
│   │       ├── register.ts      # Lógica de registro
│   │       ├── mfa-enroll.ts    # Registro de MFA/2FA
│   │       ├── mfa-unenroll.ts  # Desactivación de MFA
│   │       └── mfa-verify.ts    # Verificación de códigos MFA
│   ├── app/                     # Rutas y páginas de Next.js
│   │   ├── api/                 # API Routes
│   │   │   ├── ai/              # Endpoints de IA
│   │   │   │   ├── claude/      # API de Claude (Anthropic)
│   │   │   │   │   └── route.ts # Endpoint principal de Claude
│   │   │   │   └── shared/      # Utilidades compartidas
│   │   │   │       ├── prompts.ts    # Construcción de prompts
│   │   │   │       ├── types.ts      # Tipos TypeScript de IA
│   │   │   │       └── webSearch.ts  # Web scraping para SEO
│   │   │   └── userTier.ts      # Gestión de roles de usuario (para el futuro)
│   │   ├── auth/                # Páginas de autenticación
│   │   │   ├── login/           # Inicio de sesión
│   │   │   │   ├── form.tsx     # Formulario de login
│   │   │   │   └── page.tsx     # Página de login
│   │   │   ├── register/        # Registro de usuarios
│   │   │   │   ├── form.tsx     # Formulario de registro
│   │   │   │   └── page.tsx     # Página de registro
│   │   │   ├── mfa-verify/      # Verificación MFA
│   │   │   │   └── page.tsx     # Página de verificación 2FA
│   │   │   └── ResetPassword/   # Recuperación de contraseña
│   │   │       └── page.tsx     # Página de reset de password
│   │   ├── dashboard/           # Panel de usuario
│   │   │   ├── loading.tsx      # Loading state del dashboard
│   │   │   └── page.tsx         # Página principal del dashboard
│   │   ├── globals.css          # Estilos globales
│   │   ├── layout.tsx           # Layout raíz de la aplicación
│   │   └── page.tsx             # Landing page
│   ├── components/              # Componentes reutilizables
│   │   ├── auth/                # Componentes de autenticación
│   │   │   ├── LoginForm.tsx    # Formulario de login
│   │   │   └── RegisterForm.tsx # Formulario de registro
│   │   ├── dashboard/           # Componentes del dashboard
│   │   │   ├── AvatarUploader.tsx   # Subida de avatar
│   │   │   ├── HeroDashboard.tsx    # Hero del dashboard
│   │   │   └── MainDashboard.tsx    # Contenido principal
│   │   ├── Header.tsx           # Barra de navegación principal
│   │   ├── HeaderClient.tsx     # Lógica cliente del header
│   │   ├── Hero.tsx             # Hero de landing + analizador SEO
│   │   ├── MobileMenu.tsx       # Menú responsive
│   │   ├── MFAEnrollDialog.tsx  # Diálogo para activar 2FA
│   │   ├── MFASettings.tsx      # Configuración de MFA
│   │   └── MFAVerifyDialog.tsx  # Diálogo de verificación 2FA
│   ├── lib/                     # Utilidades y configuraciones
│   │   ├── supabase/            # Configuración de Supabase
│   │   │   ├── client.ts        # Cliente para navegador
│   │   │   ├── server.ts        # Cliente para servidor
│   │   │   └── proxy.ts         # Proxy de Supabase
│   │   └── rateLimit.ts         # Rate limiting para seguridad
│   ├── types/                   # Definiciones de tipos
│   │   ├── auth.ts              # Tipos de autenticación
│   │   └── user.ts              # Tipos de usuario
│   └── utils/                   # Funciones utilitarias
│       └── validation.ts        # Validaciones de formularios
├── public/                      # Archivos estáticos
├── .env.local                   # Variables de entorno (no incluido en git)
├── MFA_DOCUMENTATION.md         # Documentación del sistema MFA
├── next.config.ts               # Configuración de Next.js
├── tailwind.config.ts           # Configuración de Tailwind CSS
├── tsconfig.json                # Configuración de TypeScript
└── package.json                 # Dependencias y scripts
```

## 🔐 Sistema de Autenticación

El proyecto implementa un sistema completo de autenticación con:

- **Registro de usuarios** con validación de contraseñas
- **Inicio de sesión** con email y contraseña
- **Gestión de sesiones** mediante cookies seguras
- **Subida de avatares** con almacenamiento en Supabase Storage
- **Autenticación de dos factores (2FA/MFA)** con códigos TOTP
- **Rate limiting** para prevenir ataques de fuerza bruta
- **Recuperación de contraseña** mediante email

### Requisitos de Contraseña
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un símbolo especial (@#$%^&*()_+-=[]{}|;:'",.<>?)

## 🎨 Características de la UI

- **Diseño responsive** adaptado a móviles, tablets y escritorio
- **Tema oscuro** con gradientes personalizados
- **Componentes reutilizables** con Tailwind CSS
- **Navegación intuitiva** con header dinámico
- **Feedback visual** para acciones del usuario

## 🔄 Flujo de Usuario

1. **Landing Page** - Presentación del producto
2. **Registro/Login** - Autenticación del usuario
3. **Dashboard** - Panel personalizado con:
   - Información del perfil
   - Gestión de avatar
   - Visualización del rol
4. **Análisis SEO** (próximamente) - Herramienta principal de análisis

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👨‍💻 Autor

Desarrollado con ❤️ por Martin Adolfo Bravo Montaños, para mejorar el SEO de contenido web

**Los comentarios, el formateado de los archivos y el README.md han sido generados por Claude Code, Abacus AI CLI es caca podrida**
