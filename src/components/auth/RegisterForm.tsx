'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/src/actions/auth/register';
import { useToast } from '@/src/components/ui/Toast';
import { useFormStatus } from 'react-dom';

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="bg-gray-800 hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 border-2 border-black rounded-lg mt-4 transition-colors mx-auto inline-flex items-center gap-2"
    >
      {pending && (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {pending ? 'Registrando…' : 'Registrarme'}
    </button>
  );
}

const RULES: { id: string; label: string; test: (pw: string) => boolean }[] = [
  { id: 'length', label: 'Mínimo de 8 caracteres', test: (pw) => pw.length >= 8 },
  { id: 'lower', label: 'Una letra minúscula', test: (pw) => /[a-z]/.test(pw) },
  { id: 'upper', label: 'Una letra mayúscula', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'number', label: 'Un número', test: (pw) => /[0-9]/.test(pw) },
  { id: 'symbol', label: 'Un símbolo especial', test: (pw) => /[!@#$%^&*(),.?":{}|<>_+\-=[\];:'"/\\]/.test(pw) },
];

export default function RegisterForm() {
  const toast = useToast();
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const ruleState = useMemo(() => RULES.map((r) => ({ ...r, passed: r.test(password) })), [password]);
  const allPassed = ruleState.every((r) => r.passed);

  const handleSubmit = async (formData: FormData) => {
    setErrorMessage('');

    const result = await registerAction(formData);
    if (result?.error) {
      setErrorMessage(result.error);
      toast.error(result.error);
      return;
    }
  };

  const clearError = () => {
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-3xl font-title font-black text-white mt-4 mb-6 uppercase">
        Registro | OPTIMISEO
      </h1>

      <form action={handleSubmit} className="flex flex-col gap-4 md:min-w-2xl lg:min-w-3xl">
        <div className="flex flex-row items-center">
          <label htmlFor="firstName" className="text-md md:text-lg text-white px-4 py-2 w-40">
            Tu nombre:
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="border-2 border-white rounded-lg px-2 py-1 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            autoComplete="given-name"
            onChange={clearError}
            required
          />
        </div>

        <div className="flex flex-row items-center">
          <label htmlFor="lastName" className="text-md md:text-lg text-white px-4 py-2 w-40">
            Tu apellido:
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="border-2 border-white rounded-lg px-2 py-1 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            autoComplete="family-name"
            onChange={clearError}
            required
          />
        </div>

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
            onChange={clearError}
            required
          />
        </div>

        <div className="flex flex-row items-center">
          <label htmlFor="password" className="text-md md:text-lg text-white px-4 py-2 w-40">
            Contraseña:
          </label>
          <div className="flex-1 flex items-center gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              minLength={8}
              className="border-2 border-white rounded-lg px-2 py-1 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              aria-describedby="password-rules"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className="text-xs text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded whitespace-nowrap"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="bg-red-200 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg mx-auto max-w-md"
          >
            <p className="font-bold text-sm">{errorMessage}</p>
          </div>
        )}

        <div id="password-rules" className="mx-auto" aria-live="polite">
          <p className={`text-sm font-extrabold ${allPassed ? 'text-green-400' : 'text-orange-400'}`}>
            {allPassed ? 'Contraseña válida' : 'La contraseña debe seguir las siguientes reglas:'}
          </p>
          <ul className="text-sm font-bold ml-4">
            {ruleState.map((r) => (
              <li key={r.id} className={r.passed ? 'text-green-400' : 'text-orange-200'}>
                <span aria-hidden="true">{r.passed ? '✓ ' : '○ '}</span>
                {r.label}
                {r.passed && <span className="sr-only">: cumplido</span>}
              </li>
            ))}
          </ul>
        </div>

        <SubmitButton disabled={!allPassed} />
      </form>

      <Link href="/auth/login" className="text-white mt-4 hover:underline">
        ¿Ya tienes cuenta? Inicia sesión aquí
      </Link>
    </div>
  );
}
