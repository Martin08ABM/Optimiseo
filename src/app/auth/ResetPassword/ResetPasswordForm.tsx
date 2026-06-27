'use client';

import { useState } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useToast } from '@/src/components/ui/Toast';

export default function ResetPasswordForm() {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      setMessage('Contraseña actualizada correctamente');
      toast.success('Contraseña actualizada correctamente');
      setPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <h1 className="text-2xl md:text-3xl font-title font-black text-white mt-4 mb-6 uppercase">
        Cambiar la contraseña - OPTIMISEO
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <div className="flex flex-col">
          <label htmlFor="password" className="text-white mb-2">Nueva contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="confirmPassword" className="text-white mb-2">Confirmar contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && <p role="alert" className="text-red-400">{error}</p>}
        {message && <p role="status" className="text-green-400">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Actualizando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}
