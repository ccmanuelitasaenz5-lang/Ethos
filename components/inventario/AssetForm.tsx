'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { assetSchema, AssetFormValues } from '@/lib/validations/asset'
import { createAsset } from '@/app/actions/assets'
import { toast } from 'react-hot-toast'

export default function AssetForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<AssetFormValues>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            name: '',
            category: '',
            purchase_date: new Date().toISOString().split('T')[0],
            cost_usd: 0,
            useful_life_months: 60,
            location: '',
            status: 'active',
            description: ''
        }
    })

    const costUSD = watch('cost_usd')
    const usefulLife = watch('useful_life_months')

    const monthlyDepreciation = (costUSD && usefulLife && usefulLife > 0) 
        ? (costUSD / usefulLife).toFixed(2) 
        : '0.00'

    async function onSubmit(data: AssetFormValues) {
        setLoading(true)
        
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString())
            }
        })

        try {
            const result = await createAsset(formData)

            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Activo guardado correctamente')
                router.push('/dashboard/inventario')
                router.refresh()
            }
        } catch (e) {
            toast.error('Error inesperado al guardar el activo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nombre del Activo *</label>
                    <input
                        type="text"
                        {...register('name')}
                        placeholder="Ej: Computadora Dell Latitude"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Categoría *</label>
                    <select
                        {...register('category')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
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
                    {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Compra *</label>
                    <input
                        type="date"
                        {...register('purchase_date')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.purchase_date && <p className="mt-1 text-xs text-red-600">{errors.purchase_date.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Costo USD *</label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            {...register('cost_usd')}
                            className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0.00"
                        />
                    </div>
                    {errors.cost_usd && <p className="mt-1 text-xs text-red-600">{errors.cost_usd.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Vida Útil (meses) *</label>
                    <input
                        type="number"
                        {...register('useful_life_months')}
                        placeholder="60"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Ej: 60 meses = 5 años</p>
                    {errors.useful_life_months && <p className="mt-1 text-xs text-red-600">{errors.useful_life_months.message}</p>}
                </div>

                {(costUSD > 0 && usefulLife > 0) && (
                    <div className="sm:col-span-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Depreciación Mensual:</span> ${monthlyDepreciation}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Este monto se utilizará para el cálculo de depreciación acumulada
                            </p>
                        </div>
                    </div>
                )}

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                    <input
                        type="text"
                        {...register('location')}
                        placeholder="Ej: Oficina Principal, Piso 2"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : 'Guardar Activo'}
                </button>
            </div>
        </form>
    )
}
