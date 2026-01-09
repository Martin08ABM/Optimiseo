/**
 * Componente de formulario de inicio de sesión
 *
 * Este componente renderiza el formulario para que los usuarios existentes
 * puedan iniciar sesión en la aplicación.
 *
 * Características:
 * - Validación de campos requeridos (email y contraseña)
 * - Manejo de errores con alertas
 * - Autocompletado de navegador habilitado
 * - Enlace a la página de registro para nuevos usuarios
 *
 * @component
 * @returns {JSX.Element} Formulario de inicio de sesión
 */

'use client';

import { loginAction } from '@/src/actions/auth/login';
import Link from 'next/link';

export default function LogInForm() {

  /**
   * Maneja el envío del formulario de inicio de sesión
   *
   * @param {FormData} formData - Datos del formulario
   */
  const handleSubmit = async (formData: FormData) => {
    const result = await loginAction(formData)
    if (result?.error) {
      alert(result.error)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className="text-2xl md:text-3xl font-title font-black text-black mt-4 mb-6 uppercase">
        Inicio de Sesión | OPTIMISEO
      </h1>
      
      <form action={handleSubmit} className='flex flex-col gap-4 md:min-w-2xl lg:min-w-3xl'>
        <div className="flex flex-row items-center">
          <label htmlFor="email" className='text-md md:text-lg text-white px-4 py-2 w-40'>
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className='border-2 border-white rounded-lg px-2 py-1 bg-white focus:outline-none flex-1' 
            autoComplete='email'
            required
          />
        </div>

        <div className="flex flex-row items-center">
          <label htmlFor="password" className='text-md md:text-lg text-white px-4 py-2 w-40'>
            Contraseña:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className='border-2 border-white rounded-lg px-2 py-1 bg-white focus:outline-none flex-1' 
            autoComplete="current-password"
            required
          />
        </div>

        <button 
          type="submit"
          className='bg-gray-800 hover:bg-gray-600 text-white font-bold py-3 px-6 border-2 border-black rounded-lg mt-4 transition-colors mx-auto'
        >
          Iniciar Sesión
        </button>
      </form>
      
      <Link href="/auth/register" className="text-white mt-4 hover:underline">
        ¿No tienes cuenta? Regístrate aquí
      </Link>
    </div>
  )
}