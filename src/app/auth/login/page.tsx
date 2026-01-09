/**
 * Página de inicio de sesión
 *
 * Renderiza el formulario de login para usuarios existentes.
 *
 * Ruta: /auth/login
 *
 * @page
 */

import LoginForm from '@/src/components/auth/LoginForm'

export default function LogIn() {
  return (
    <div className="flex flex-col px-4 py-2 min-h-screen bg-gray-700">
      <LoginForm />
    </div>
  )
}