'use client';

import { useState, useEffect } from 'react';
import { DiscountCodeForm } from '@/src/components/admin/DiscountCodeForm';
import { DiscountCodeTable } from '@/src/components/admin/DiscountCodeTable';

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/discount-codes?includeInactive=true');
      const data = await res.json();
      setCodes(data.codes || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Códigos de Descuento</h1>
        <p className="mt-2 text-gray-300">
          Crea y gestiona códigos de descuento para tus usuarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DiscountCodeForm onSuccess={fetchCodes} />
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-gray-800 border-2 border-gray-600 p-12 rounded-xl shadow-lg text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="mt-4 text-gray-300">Cargando códigos...</p>
            </div>
          ) : (
            <DiscountCodeTable initialCodes={codes} />
          )}
        </div>
      </div>
    </div>
  );
}