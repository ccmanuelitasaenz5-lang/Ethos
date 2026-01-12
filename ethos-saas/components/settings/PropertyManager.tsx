'use client'

import { useState } from 'react'
import { createProperty, deleteProperty } from '@/app/actions/properties'

interface Property {
    id: string
    number: string
    owner_name: string | null
    aliquot: number
}

export default function PropertyManager({ properties }: { properties: Property[] }) {
    const [isCreating, setIsCreating] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleCreate(formData: FormData) {
        setLoading(true)
        await createProperty(formData)
        setLoading(false)
        setIsCreating(false)
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Seguro que deseas eliminar esta propiedad?')) return
        await deleteProperty(id)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Propiedades / Unidades</h3>
                    <p className="text-sm text-gray-500">Gestiona los apartamentos o locales para asignar ingresos.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                >
                    Nueva Propiedad
                </button>
            </div>

            {isCreating && (
                <form action={handleCreate} className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Número / Código</label>
                            <input name="number" required placeholder="Ej: A-12" className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Propietario (Opcional)</label>
                            <input name="owner_name" placeholder="Nombre" className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Alicuota (%)</label>
                            <input name="aliquot" type="number" step="0.000001" placeholder="0.00" className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">{loading ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </form>
            )}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Número</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Propietario</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Alicuota</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {properties.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No hay propiedades registradas.</td></tr>
                        ) : properties.map(p => (
                            <tr key={p.id}>
                                <td className="px-4 py-2 font-medium">{p.number}</td>
                                <td className="px-4 py-2 text-gray-500">{p.owner_name || '-'}</td>
                                <td className="px-4 py-2 text-gray-500">{p.aliquot}%</td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 text-xs">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
