/**
 * Componente MainDashboard - Panel principal del usuario
 * 
 * Este componente muestra la información del perfil del usuario autenticado.
 * 
 * Características:
 * - Obtiene y muestra información del usuario desde Supabase
 * - Consulta el rol del usuario desde la tabla user_roles
 * - Muestra el componente de subida de avatar
 * - Muestra el email del usuario
 * - Muestra el rol asignado (basic, premium, admin, etc.)
 * - Incluye logs de debug para facilitar el desarrollo
 * 
 * @component
 * @returns {Promise<JSX.Element | null>} Panel de usuario o null si no está autenticado
 */

'use server';

import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import AvatarUploader from "./AvatarUploader";
import Link from "next/link";

export default async function MainDashboard() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userEmail = user?.email
  const resterPassword = await supabase.auth.resetPasswordForEmail( userEmail!, {
    redirectTo: 'http://localhost:3000/auth/ResetPassword',
  })

  if (!user) return null;

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const userRole = roleData?.role || "Sin rol asignado";

  // Fecha del útlimo inicio de sesión
  const userLastSingIn = user?.last_sign_in_at;
  const dateLastSignIn = new Date(userLastSingIn)

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateLastSignIn).replace(/\//g, '-'); 


  // Fecha de creación de la cuenta
  const userCreatedAt = user?.created_at;
  const dateCreatedAt = new Date(userCreatedAt)

  const formattedDateCreatedAt = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateCreatedAt).replace(/\//g, '-'); 


  return (
    <div className="flex flex-col mx-auto mt-6">

      {/* Información de la cuenta */}
      <section>
        <p className="text-2xl font-title font-extrabold text-neutral-100">
          Información del perfil:
        </p>

        <div className="flex flex-row text-md text-white mt-2 ml-4">
          <div className="flex flex-col gap-y-4">
            
            <AvatarUploader />

            <p>
              Correo electrónico:{" "}
              <span className="text-blue-400">{user.email}</span>
            </p>
            <p>
              Rol: <span className="text-green-400 font-semibold">{userRole}</span>
            </p>

            <p>
              Último inicio de sesión: <span>{formattedDate}</span>
            </p>

            <p>
              Cuenta creada el: <span>{formattedDateCreatedAt}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Seguridad y acceso a la cuenta */}
      <section>
        <p className="text-2xl font-title font-extrabold text-neutral-100">
          Seguridad y acceso:
        </p>

        <div className="flex flex-row text-md text-white mt-2 ml-4">
          <div className="flex flex-col gap-y-4">

            <p>
              Cambiar contraseña: <Link href={resterPassword} className="hover:text-blue-400 transition-colors duration-150">clica aquí</Link>
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}
