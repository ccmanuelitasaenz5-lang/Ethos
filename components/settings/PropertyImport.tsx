'use client'

import { useState } from 'react'
import { importPropertiesFromText } from '@/app/actions/properties'

export default function PropertyImport() {
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: number; error: number } | null>(null)

    async function handleImport() {
        if (!text.trim()) return

        setLoading(true)
        setResult(null)

        const res = await importPropertiesFromText(text)

        if (res.error && typeof res.error === 'string') {
            alert(res.error)
        } else {
            setResult(res as { success: number; error: number })
            if ((res as any).success > 0) {
                setText('') // Crear on success
            }
        }

        setLoading(false)
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Carga Masiva de Propiedades</h3>
            <p className="text-sm text-gray-600 mb-4">
                Pega aquí tu lista de propiedades en formato texto simple.
                <br />
                Formato por línea: <span className="font-mono bg-gray-100 px-1 rounded">Número | Propietario | Alicuota</span>
                <br />
                Ejemplo: <span className="text-gray-500 italic">A-12 | Juan Perez | 1.25</span>
            </p>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="w-full text-sm font-mono border border-gray-300 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500"
                placeholder={`A-01 | Maria Garcia | 1.45\nA-02 | Pedro Perez | 1.45\nPB-01 | Local Comercial | 2.10`}
            />

            <div className="mt-4 flex items-center justify-between">
                <div>
                    {result && (
                        <span className="text-sm">
                            Resultado: <span className="text-green-600 font-bold">{result.success} creados</span>,{' '}
                            <span className="text-red-600 font-bold">{result.error} fallos</span>
                        </span>
                    )}
                </div>
                <button
                    onClick={handleImport}
                    disabled={loading || !text.trim()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Procesando...' : 'Importar Propiedades'}
                </button>
            </div>
        </div>
    )
}
