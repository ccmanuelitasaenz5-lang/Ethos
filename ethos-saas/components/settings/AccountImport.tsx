'use client'

import { useState } from 'react'
import { importAccountsFromText } from '@/app/actions/accounting'

export default function AccountImport() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success?: number, error?: number | string } | null>(null)

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setResult(null)

        try {
            const text = await file.text()
            const importResult = await importAccountsFromText(text)
            setResult(importResult)
        } catch (error) {
            console.error('Error reading file:', error)
            alert('Error al leer el archivo')
        }

        setLoading(false)
        // Reset input
        e.target.value = ''
    }

    return (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
            <h3 className="text-sm font-bold text-blue-900 uppercase">Importar desde TXT</h3>
            <p className="text-[10px] text-blue-700 leading-tight">
                El archivo debe tener el formato: <br />
                <code className="bg-blue-100 px-1">Código | Nombre | Tipo | Movimiento (S/N)</code><br />
                Tipos: ASSET, LIABILITY, EQUITY, INCOME, EXPENSE
            </p>
            <div className="flex items-center space-x-2">
                <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
            </div>
            {loading && <p className="text-xs text-blue-600 animate-pulse">Procesando archivo...</p>}
            {result && (
                <p className="text-xs font-medium text-blue-800">
                    Importación finalizada: {result.success} exitosas, {result.error} errores.
                </p>
            )}
        </div>
    )
}
