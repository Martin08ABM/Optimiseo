'use client';

import { useState } from 'react';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  is_blocked: boolean;
  blocked_reason?: string;
  subscription_status: string;
  total_analyses: number;
}

interface UserTableProps {
  initialUsers: User[];
  total: number;
}

export function UserTable({ initialUsers, total }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    const reason = isBlocked
      ? prompt('Razón del bloqueo (opcional):')
      : null;

    if (isBlocked && reason === null) return; // Usuario canceló

    setLoading(userId);

    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked, reason }),
      });

      if (res.ok) {
        // Actualizar lista local
        setUsers(users.map(u =>
          u.id === userId
            ? { ...u, is_blocked: isBlocked, blocked_reason: reason || undefined }
            : u
        ));
        alert(isBlocked ? 'Usuario bloqueado' : 'Usuario desbloqueado');
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar usuario');
      }
    } catch (error) {
      alert('Error al procesar solicitud');
    } finally {
      setLoading(null);
    }
  };

  const filteredUsers = users
    .filter(u => {
      if (filter === 'blocked') return u.is_blocked;
      if (filter === 'active') return !u.is_blocked;
      if (filter === 'pro') return u.subscription_status === 'active';
      return true;
    })
    .filter(u =>
      search ? u.email.toLowerCase().includes(search.toLowerCase()) : true
    );

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="blocked">Bloqueados</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-800 border-2 border-gray-600 rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Análisis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className={user.is_blocked ? 'bg-red-900 bg-opacity-20' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.email}
                  {user.is_blocked && user.blocked_reason && (
                    <p className="text-xs text-red-400 mt-1">
                      Bloqueado: {user.blocked_reason}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.subscription_status === 'active'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-200'
                    }`}
                  >
                    {user.subscription_status === 'active' ? 'Pro' : 'Free'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.total_analyses}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_blocked
                        ? 'bg-red-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    {user.is_blocked ? 'Bloqueado' : 'Activo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleBlock(user.id, !user.is_blocked)}
                    disabled={loading === user.id}
                    className={`px-3 py-1 rounded ${
                      user.is_blocked
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed transition`}
                  >
                    {loading === user.id
                      ? 'Procesando...'
                      : user.is_blocked
                      ? 'Desbloquear'
                      : 'Bloquear'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No se encontraron usuarios
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400">
        Mostrando {filteredUsers.length} de {total} usuarios
      </p>
    </div>
  );
}