'use client';
import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Image from "next/image";
import { useToast } from "@/src/components/ui/Toast";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function AvatarUploader() {
  const supabase = createClient();
  const toast = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.avatar_url) {
        setPreview(`${user.user_metadata.avatar_url}?t=${Date.now()}`);
      }
    };
    loadAvatar();
  }, [supabase.auth]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('La imagen supera los 2 MB. Elige una más pequeña.');
      e.target.value = '';
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Formato no soportado. Usa JPEG, PNG o WebP.');
      e.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const ext = file.name.split('.').pop()?.toLowerCase();
      const filePath = `${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;

      window.dispatchEvent(new Event('avatarUpdated'));
      toast.success('¡Avatar actualizado!');
    } catch (error: unknown) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al subir avatar';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 rounded-full bg-neutral-700 overflow-hidden border-2 border-gray-600">
        {preview ? (
          <Image
            src={preview}
            alt="Tu foto de perfil"
            className="w-full h-full object-cover"
            width={96}
            height={96}
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl" aria-hidden="true">👤</div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
            Subiendo…
          </div>
        )}
      </div>
      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
        {loading ? 'Procesando…' : 'Cambiar foto'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />
      </label>
    </div>
  );
}
