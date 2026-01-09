// src/app/auth/register/form.tsx
/**
 * Componente de formulario de registro
 *
 * Este componente renderiza el formulario para que nuevos usuarios
 * puedan crear una cuenta en la aplicación.
 *
 * Características:
 * - Validación de campos requeridos (nombre, apellido, email, contraseña)
 * - Validación de contraseña con requisitos de seguridad
 * - Manejo de errores con mensajes visuales
 * - Limpieza automática de errores al escribir
 * - Información clara sobre requisitos de contraseña
 * - Enlace a la página de login para usuarios existentes
 *
 * @component
 * @returns {JSX.Element} Formulario de registro
 */

'use client';

import { registerAction } from '@/src/actions/auth/register';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * Maneja el envío del formulario de registro
   *
   * @param {FormData} formData - Datos del formulario
   */
  const handleSubmit = async (formData: FormData) => {
    setErrorMessage('')

    const result = await registerAction(formData)
    if (result?.error) {
      setErrorMessage(result.error)
      return
    }
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className='text-2xl md:text-3xl font-title font-black text-black mt-4 mb-6 uppercase'>
        Registro | OPTIMISEO
      </h1>
      
      <form action={handleSubmit} className='flex flex-col gap-4 md:min-w-2xl lg:min-w-3xl'>
        {/* Campo de nombre */}
        <div className='flex flex-row items-center'>
          <label htmlFor="firstName" className='text-md md:text-lg text-white px-4 py-2 w-40'>
            Tu nombre:
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className='border-2 border-white rounded-lg px-2 py-1 bg-white focus:outline-none flex-1'
            autoComplete='given-name'
            required
          />
        </div>

        {/* Campo de apellido */}
        <div className='flex flex-row items-center'>
          <label htmlFor="lastName" className='text-md md:text-lg text-white px-4 py-2 w-40'>
            Tu apellido:
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className='border-2 border-white rounded-lg px-2 py-1 bg-white focus:outline-none flex-1'
            autoComplete='family-name'
            required
          />
        </div>

        {/* Campo de email */}
        <div className='flex flex-row items-center'>
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

        {/* Campo de contraseña con validación mínima */}
        <div className='flex flex-row items-center'>
          <label htmlFor="password" className='text-md md:text-lg text-white px-4 py-2 w-40'>
            Contraseña:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            minLength={8}
            className='border-2 border-white rounded-lg px-2 py-1 bg-white focus:outline-none flex-1'
            onChange={() => {
              // Limpiar el error cuando el usuario empiece a escribir
              if (errorMessage) setErrorMessage('')
            }}
            required
          />
        </div>

        {/* Mensaje de error estilizado con fondo rojo */}
        {errorMessage && (
          <div className='bg-red-200 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg mx-auto max-w-md'>
            <p className='font-bold text-sm'>{errorMessage}</p>
          </div>
        )}

        {/* Requisitos de contraseña para guiar al usuario */}
        <div className='mx-auto'>
          <p className='text-sm text-orange-400 font-extrabold'>
            La contraseña debe de seguir las siguientes reglas:
          </p>
          <ul className='text-orange-200 text-sm font-bold decoration-2 underline ml-4'>
            <li>Mínimo de 8 caracteres</li>
            <li>Letras mayúsculas y minúsculas</li>
            <li>Números</li>
            <li>Símbolos <span>{"@#$%^&*()_+-=[]{}|;:'\",.<>?"}</span></li>
          </ul>
        </div>
        
        {/* Botón de envío del formulario */}
        <button
          type="submit"
          className='bg-gray-800 hover:bg-gray-600 text-white font-bold py-3 px-6 border-2 border-black rounded-lg mt-4 transition-colors mx-auto'
        >
          Registrarme
        </button>
      </form>

      {/* Enlace para usuarios que ya tienen cuenta */}
      <Link href="/auth/login" className="text-white mt-4 hover:underline">
        ¿Ya tienes cuenta? Inicia sesión aquí
      </Link>
    </div>
  )
}