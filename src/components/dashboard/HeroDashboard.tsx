/**
 * Componente HeroDashboard - Encabezado del panel de usuario
 * 
 * Este componente muestra el título y descripción del área privada del usuario.
 * Se renderiza en la parte superior del dashboard.
 * 
 * @component
 * @returns {Promise<JSX.Element>} Hero del dashboard
 */

'use server';

export default async function HeroDashboard() {
  return (
    <section className='flex flex-col items-center justify-center  mx-auto'>
      <h1 className="text-2xl md:text-3xl font-title font-black text-white mt-4 mb-6 uppercase">Mi perfil - OPTIMISEO</h1>
      <p className="text-white">Esta zona es tu área privada</p>
    </section>
  )
}
