# 🚀 OptimiSEO

**OptimiSEO** es un analizador de SEO inteligente que utiliza IA para evaluar y optimizar el contenido web. La aplicación analiza textos y títulos, proporcionando métricas detalladas sobre legibilidad, repetición de palabras y coherencia del contenido.

## 📋 Descripción del Proyecto

OptimiSEO es una herramienta diseñada para ayudar a creadores de contenido, bloggers y profesionales del marketing digital a mejorar la calidad SEO de sus publicaciones. Mediante el uso de inteligencia artificial, la aplicación:

- ✅ Analiza la legibilidad del contenido
- ✅ Detecta repetición excesiva de palabras
- ✅ Evalúa la coherencia entre título y contenido
- ✅ Sugiere títulos alternativos optimizados para SEO
- ✅ Proporciona métricas detalladas y recomendaciones

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

### Herramientas de Desarrollo
- **ESLint 9** - Linter para mantener código limpio
- **PostCSS 8.5.6** - Procesador de CSS

## 📁 Estructura del Proyecto

```
optimiseo/
├── src/
│   ├── app/                      # Rutas y páginas de Next.js
│   │   ├── auth/                 # Sistema de autenticación
│   │   │   ├── login/           # Página de inicio de sesión
│   │   │   │   ├── actions.ts   # Acciones del servidor para login
│   │   │   │   ├── form.tsx     # Formulario de login
│   │   │   │   └── page.tsx     # Página principal de login
│   │   │   └── register/        # Página de registro
│   │   │       ├── actions.ts   # Acciones del servidor para registro
│   │   │       ├── form.tsx     # Formulario de registro
│   │   │       ├── insertUserRole.ts # Asignación de roles
│   │   │       └── page.tsx     # Página principal de registro
│   │   ├── dashboard/           # Panel de usuario
│   │   │   ├── avatarUploader.tsx    # Componente para subir avatar
│   │   │   ├── heroDashboard.tsx     # Hero del dashboard
│   │   │   ├── mainDashboard.tsx     # Contenido principal del dashboard
│   │   │   └── page.tsx              # Página del dashboard
│   │   ├── globals.css          # Estilos globales
│   │   ├── layout.tsx           # Layout principal de la aplicación
│   │   └── page.tsx             # Página de inicio
│   ├── components/              # Componentes reutilizables
│   │   ├── Header.tsx           # Barra de navegación
│   │   └── Hero.tsx             # Sección hero de la landing page
│   └── lib/                     # Utilidades y configuraciones
│       ├── supabaseClient.ts    # Cliente de Supabase para el navegador
│       └── supabaseServer.ts    # Cliente de Supabase para el servidor
├── public/                      # Archivos estáticos
├── .env.local                   # Variables de entorno (no incluido en git)
├── next.config.ts               # Configuración de Next.js
├── tailwind.config.ts           # Configuración de Tailwind CSS
├── tsconfig.json                # Configuración de TypeScript
└── package.json                 # Dependencias y scripts

```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 20 o superior
- npm, pnpm o yarn
- Cuenta de Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio> Poner la URL del repositorio de Github
cd optimiseo
```

2. **Instalar dependencias**
```bash
npm install
# o
pnpm install
# o
yarn install
```

3. **Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu_clave_publicable
```

4. **Configurar Supabase**

En tu proyecto de Supabase, crea las siguientes tablas:

**Tabla: user_roles**
```sql
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Bucket de Storage: avatars**
- Crear un bucket público llamado "avatars"
- Configurar políticas de acceso para permitir subida y lectura

5. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
pnpm dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter para verificar el código

## 🔐 Sistema de Autenticación

El proyecto implementa un sistema completo de autenticación con:

- **Registro de usuarios** con validación de contraseñas
- **Inicio de sesión** con email y contraseña
- **Gestión de sesiones** mediante cookies seguras
- **Sistema de roles** (basic, premium, admin)
- **Subida de avatares** con almacenamiento en Supabase Storage

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

## 📄 Licencia

Este proyecto es privado y está en desarrollo.

## 👨‍💻 Autor

Desarrollado con ❤️ por Martin Adolfo Bravo Montaños, para mejorar el SEO de contenido web

## 🔮 Roadmap

- [ ] Implementar análisis de SEO con IA
- [ ] Agregar generador de títulos alternativos
- [ ] Sistema de métricas y reportes
- [ ] Integración con APIs de análisis de texto
- [ ] Dashboard con estadísticas históricas
- [ ] Exportación de reportes en PDF
- [ ] Sistema de planes y suscripciones

## 📞 Soporte

Para reportar bugs o solicitar features, por favor abre un issue en el repositorio.
**Los comentarios, el formateado de los archivos y el README.md han sido generados por ABACUS AI**