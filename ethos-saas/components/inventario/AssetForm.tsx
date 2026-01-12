'use client'

import { useState } from 'react'
import { createAsset } from '@/app/actions/assets'
import { useRouter } from 'next/navigation'

export default function AssetForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [costUSD, setCostUSD] = useState('')
    const [usefulLife, setUsefulLife] = useState('')

    const calculateMonthlyDepreciation = () => {
        if (costUSD && usefulLife) {
            const cost = parseFloat(costUSD)
            const months = parseInt(usefulLife)
            if (months > 0) {
                return (cost / months).toFixed(2)
            }
        }
        return '0.00'
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await createAsset(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push('/dashboard/inventario')
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nombre del Activo *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ej: Computadora Dell Latitude"
                    />
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Categoría
                    </label>
                    <select
                        id="category"
                        name="category"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="Equipos de Oficina">Equipos de Oficina</option>
                        <option value="Muebles">Muebles</option>
                        <option value="Vehículos">Vehículos</option>
                        <option value="Equipos de Cómputo">Equipos de Cómputo</option>
                        <option value="Maquinaria">Maquinaria</option>
                        <option value="Herramientas">Herramientas</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
                        Fecha de Compra *
                    </label>
                    <input
                        type="date"
                        id="purchase_date"
                        name="purchase_date"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label htmlFor="cost_usd" className="block text-sm font-medium text-gray-700">
                        Costo USD *
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="cost_usd"
                            name="cost_usd"
                            required
                            step="0.01"
                            min="0"
                            value={costUSD}
                            onChange={(e) => setCostUSD(e.target.value)}
                            className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="cost_ves" className="block text-sm font-medium text-gray-700">
                        Costo VES (Opcional)
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Bs.</span>
                        </div>
                        <input
                            type="number"
                            id="cost_ves"
                            name="cost_ves"
                            step="0.01"
                            min="0"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="useful_life_months" className="block text-sm font-medium text-gray-700">
                        Vida Útil (meses) *
                    </label>
                    <input
                        type="number"
                        id="useful_life_months"
                        name="useful_life_months"
                        required
                        min="1"
                        value={usefulLife}
                        onChange={(e) => setUsefulLife(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="60"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Ej: 60 meses = 5 años
                    </p>
                </div>

                {costUSD && usefulLife && (
                    <div className="sm:col-span-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Depreciación Mensual:</span> ${calculateMonthlyDepreciation()}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Este monto se depreciará automáticamente cada mes
                            </p>
                        </div>
                    </div>
                )}

                <div className="sm:col-span-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Ubicación
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ej: Oficina Principal, Piso 2"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Guardando...' : 'Guardar Activo'}
                </button>
            </div>
        </form>
    )
}
