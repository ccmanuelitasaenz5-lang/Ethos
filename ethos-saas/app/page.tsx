'use client'

import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import { useState } from 'react'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ETHOS</h1>
          <p className="text-gray-500 mt-2">Crear Nueva Cuenta</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              name="full_name"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-blue-50/30"
              placeholder="Tu nombre y apellido"
            />
          </div>

          {/* Nombre de la Organización - ESTO FALTABA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa / Organización</label>
            <input
              name="org_name"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-blue-50/30"
              placeholder="Ej: Contadores Asociados C.A."
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-blue-50/30"
              placeholder="usuario@correo.com"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Botón de Acción */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl font-bold text-lg transition-colors shadow-lg active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Procesando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#0088cc] font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}