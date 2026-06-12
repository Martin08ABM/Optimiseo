/**
 * Página de registro de usuarios
 *
 * Renderiza el formulario de registro para nuevos usuarios.
 *
 * Ruta: /auth/register
 *
 * @page
 */

import RegisterForm from '@/src/components/auth/RegisterForm';

export default function Register() {
  return (
    <div className="flex flex-col px-4 py-2 min-h-screen bg-linear-to-b from-slate-900 via-zinc-950 to-black">
      <RegisterForm />
    </div>
  )
}