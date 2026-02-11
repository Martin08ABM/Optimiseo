'use client';

import { useState } from 'react';

interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  is_active: boolean;
  max_uses_per_user: number;
  expires_at: string | null;
  created_at: string;
  usage?: { count: number }[];
}

interface DiscountCodeTableProps {
  initialCodes: DiscountCode[];
}

export function DiscountCodeTable({ initialCodes }: DiscountCodeTableProps) {
  const [codes, setCodes] = useState(initialCodes);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleActive = async (codeId: string, isActive: boolean) => {
    setLoading(codeId);

    try {
      const res = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        setCodes(codes.map(c =>
          c.id === codeId ? { ...c, is_active: !isActive } : c
        ));
      } else {
        alert('Error al actualizar código');
      }
    } catch (error) {
      alert('Error al procesar solicitud');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (codeId: string, code: string) => {
    if (!confirm(`¿Eliminar el código "${code}"?`)) return;

    setLoading(codeId);

    try {
      const res = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCodes(codes.filter(c => c.id !== codeId));
        alert('Código eliminado');
      } else {
        alert('Error al eliminar código');
      }
    } catch (error) {
      alert('Error al procesar solicitud');
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Código "${code}" copiado al portapapeles`);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900 text-sm">
          <tr className='text-sm'>
            <th className="px-6 py-3 text-left text-[0.5rem] font-medium text-gray-300 uppercase tracking-wider">
              Código
            </th>
            <th className="px-6 py-3 text-left text-[0.5rem] font-medium text-gray-300 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-[0.5rem] font-medium text-gray-300 uppercase tracking-wider">
              Descuento
            </th>
            <th className="px-6 py-3 text-left text-[0.5rem] font-medium text-gray-300 uppercase tracking-wider">
              Usos
            </th>
            <th className="px-6 py-3 text-left text-[0.5rem] font-medium text-gray-300 uppercase tracking-wider">
              Expira
            </th>
            <th className="px-6 py-3 text-left text-[0.5rem] font-medium text-gray-300 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-[0.5rem] font-medium text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {codes.map((code) => {
            const usageCount = code.usage?.[0]?.count || 0;
            const isExpired = !!(code.expires_at && new Date(code.expires_at) < new Date());

            return (
              <tr key={code.id} className={!code.is_active || isExpired ? 'bg-gray-900' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="font-mono font-bold text-blue-600 hover:text-blue-800"
                    title="Copiar código"
                  >
                    {code.code}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[0.5rem] text-gray-300">
                  {code.type === 'percentage' ? 'Porcentaje' : 'Fijo'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[0.5rem] text-white font-semibold">
                  {code.type === 'percentage' ? `${code.value}%` : `${code.value}€`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[0.5rem] text-gray-300">
                  {usageCount} usos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[0.5rem] text-gray-300">
                  {code.expires_at ? (
                    <span className={isExpired ? 'text-red-600' : ''}>
                      {new Date(code.expires_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">Sin expiración</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-[0.5rem] font-semibold rounded-full ${
                      code.is_active && !isExpired
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isExpired ? 'Expirado' : code.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[0.65rem] space-x-2">
                  <button
                    onClick={() => handleToggleActive(code.id, code.is_active)}
                    disabled={loading === code.id || isExpired}
                    className={`px-3 py-1 rounded ${
                      code.is_active
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed transition`}
                  >
                    {code.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(code.id, code.code)}
                    disabled={loading === code.id}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {codes.length === 0 && (
        <div className="text-center py-8 text-gray-300">
          No hay códigos de descuento
        </div>
      )}
    </div>
  );
}