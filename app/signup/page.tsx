'use client'
import { signup } from '@/app/actions/auth'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const res = await signup(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  // Estilo de input ultra-visible: Fondo gris claro, texto NEGRO intenso
  const inputClass = "w-full p-4 rounded-xl border-2 border-gray-200 bg-[#f1f5f9] text-black placeholder-gray-500 outline-none focus:border-[#0081c9] focus:bg-white transition-all";

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#001f3f] p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-[#001f3f]">ETHOS</h1>
          <p className="text-gray-500 text-sm font-bold">CREAR NUEVA CUENTA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black text-[#001f3f] ml-1">NOMBRE COMPLETO</label>
            <input name="full_name" type="text" placeholder="Tu Nombre" required className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-black text-[#001f3f] ml-1">NOMBRE DE EMPRESA</label>
            <input name="org_name" type="text" placeholder="Nombre de la Entidad" required className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-black text-[#001f3f] ml-1">CORREO ELECTRÓNICO</label>
            <input name="email" type="email" placeholder="correo@ejemplo.com" required className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-black text-[#001f3f] ml-1">CONTRASEÑA</label>
            <input name="password" type="password" placeholder="••••••••" required className={inputClass} />
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#0081c9] text-white rounded-xl font-black text-lg shadow-lg hover:bg-[#0070af] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'PROCESANDO...' : 'REGISTRAR EMPRESA'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-[#0081c9] text-sm font-bold hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}