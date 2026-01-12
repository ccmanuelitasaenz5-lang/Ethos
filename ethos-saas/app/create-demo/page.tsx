'use client'

import { createDemoUser } from '@/app/actions/demo'
import { useState } from 'react'
import Link from 'next/link'

export default function CreateDemoPage() {
    const [status, setStatus] = useState<string>('ready')
    const [result, setResult] = useState<any>(null)

    async function handleCreate() {
        setStatus('loading')
        const res = await createDemoUser()
        if (res.success) {
            setStatus('success')
            setResult(res)
        } else {
            setStatus('error')
            setResult(res)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 text-center">Configurar Usuario de Prueba</h1>
                <p className="text-gray-600 text-center">
                    Este proceso creará un usuario listo para la evaluación profesional con un plan de cuentas base ya configurado.
                </p>

                {status === 'ready' && (
                    <button
                        onClick={handleCreate}
                        className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        Generar Usuario Demo
                    </button>
                )}

                {status === 'loading' && (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Creando entorno...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                        <p className="text-green-800 font-bold">¡Usuario creado con éxito!</p>
                        <div className="text-sm font-mono bg-white p-3 rounded-lg border border-green-100 text-gray-700">
                            <p><strong>Email:</strong> {result.email}</p>
                            <p><strong>Clave:</strong> {result.password}</p>
                        </div>
                        <Link
                            href="/login"
                            className="block text-center text-primary-600 font-bold hover:underline"
                        >
                            Ir al Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                        <p className="font-bold">Error:</p>
                        <p className="text-sm">{result?.error}</p>
                        <button onClick={() => setStatus('ready')} className="mt-4 text-sm font-bold underline">Reintentar</button>
                    </div>
                )}
            </div>
        </div>
    )
}
