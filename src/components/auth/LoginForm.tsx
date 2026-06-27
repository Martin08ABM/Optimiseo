'use client';

import { loginAction } from '@/src/actions/auth/login';
import Link from 'next/link';
import { useToast } from '@/src/components/ui/Toast';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-gray-800 hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 border-2 border-black rounded-lg mt-4 transition-colors mx-auto inline-flex items-center gap-2"
    >
      {pending && (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {pending ? 'Iniciando sesión…' : 'Iniciar Sesión'}
    </button>
  );
}

export default function LoginForm() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await loginAction(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-3xl font-title font-black text-white mt-4 mb-6 uppercase">
        Inicio de Sesión | OPTIMISEO
      </h1>

      <form action={handleSubmit} className="flex flex-col gap-4 md:min-w-2xl lg:min-w-3xl">
        <div className="flex flex-row items-center">
          <label htmlFor="email" className="text-md md:text-lg text-white px-4 py-2 w-40">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="border-2 border-white rounded-lg px-2 py-1 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            autoComplete="email"
            required
          />
        </div>

        <div className="flex flex-row items-center">
          <label htmlFor="password" className="text-md md:text-lg text-white px-4 py-2 w-40">
            Contraseña:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="border-2 border-white rounded-lg px-2 py-1 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="text-right -mt-2">
          <Link href="/auth/ResetPassword" className="text-sm text-blue-300 hover:text-blue-200 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <SubmitButton />
      </form>

      <Link href="/auth/register" className="text-white mt-4 hover:underline">
        ¿No tienes cuenta? Regístrate aquí
      </Link>
      {isSubmitting && <span className="sr-only" role="status">Procesando inicio de sesión</span>}
    </div>
  );
}
