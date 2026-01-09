'use server';
import Header from "@/src/components/Header"
import {createServerSupabaseClient} from "@/src/lib/supabase/server"

export default async function ResetPassword() {

  const supabase = await createServerSupabaseClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const { data, error } = await supabase.auth.updateUser({
      password: 'new_password',
    })

    if (error) {
      console.error(error.message)
    } else {
      console.log('Contraseña actualizada')
    }
  }

  return (
    <div className="flex flex-col px-4 py-2 min-h-screen bg-gray-700">
      <Header />
      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-2xl md:text-3xl font-title font-black text-black mt-4 mb-6 uppercase'>Cambiar la contraseña - OPTIMISEO</h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="password"></label>
          <input type="password" name="password" id="password" />
        </form>
      </div>
    </div>
  )
}