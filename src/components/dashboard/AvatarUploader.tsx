/**
 * Componente AvatarUploader - Subida y gestión de avatar de usuario
 * 
 * Este componente permite a los usuarios subir y actualizar su foto de perfil.
 * 
 * Características:
 * - Vista previa en tiempo real de la imagen seleccionada
 * - Subida automática al seleccionar archivo
 * - Almacenamiento en Supabase Storage (bucket "avatars")
 * - Actualización de metadatos del usuario
 * - Indicador de carga durante la subida
 * - Soporte para formatos: JPEG, PNG, WebP
 * - Refresco automático de la sesión para mostrar el nuevo avatar
 * 
 * @component
 * @returns {JSX.Element} Componente de subida de avatar
 */

'use client';
import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Image from "next/image";

export default function AvatarUploader() {
  const supabase = createClient();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Efecto para cargar el avatar actual del usuario al montar el componente
   */
  useEffect(() => {
    const loadAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.avatar_url) {
        setPreview(`${user.user_metadata.avatar_url}?t=${Date.now()}`);
      }
    };
    loadAvatar();
  }, []);

  /**
   * Maneja el cambio de archivo y la subida del avatar
   * 
   * Flujo:
   * 1. Valida que se haya seleccionado un archivo
   * 2. Muestra vista previa local
   * 3. Obtiene el ID del usuario autenticado
   * 4. Sube el archivo a Supabase Storage con el nombre userId.ext
   * 5. Actualiza los metadatos del usuario con la URL pública
   * 6. Refresca la sesión para actualizar el avatar en toda la app
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input file
   */
  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) throw new Error("Usuario no autenticado");

      const ext = file.name.split('.').pop()?.toLowerCase();
      const filePath = `${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
        await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

        const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;

        window.dispatchEvent(new Event('avatarUpdated'));
      alert("¡Avatar actualizado! 🎉");
      
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 rounded-full bg-neutral-700 overflow-hidden border-2 border-gray-600">
        {preview ? (
          <Image src={preview} alt="" className="w-full h-full object-cover" width={14} height={14} unoptimized />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">👤</div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
            Subiendo...
          </div>
        )}
      </div>
      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
        {loading ? "Procesando..." : "Cambiar foto"}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="hidden" disabled={loading} />
      </label>
    </div>
  );
}
