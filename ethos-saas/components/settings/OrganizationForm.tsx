'use client'

import { useState } from 'react'
import { updateOrganization } from '@/app/actions/organization'

interface OrganizationFormProps {
    organization: {
        id: string
        name: string
        rif: string | null
        address: string | null
        phone: string | null
        email: string | null
        legal_representative: string | null
        representative_phone: string | null
        representative_role: string | null
    }
}

export default function OrganizationForm({ organization }: OrganizationFormProps) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage(null)

        const result = await updateOrganization(formData)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Configuración actualizada correctamente' })
        }
        setLoading(false)
    }

    return (
        <form action={handleSubmit} className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Organización</h2>

            <input type="hidden" name="organization_id" value={organization.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Organización</label>
                    <input
                        name="name"
                        type="text"
                        defaultValue={organization.name}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        placeholder="Ej: Condominio El Bosque"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RIF</label>
                    <input
                        name="rif"
                        type="text"
                        defaultValue={organization.rif || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        placeholder="J-12345678-9"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                        name="address"
                        type="text"
                        defaultValue={organization.address || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        placeholder="Calle, Ciudad, Estado"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</label>
                    <input
                        name="phone"
                        type="text"
                        defaultValue={organization.phone || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        placeholder="+58 4XX XXXX"
                    />
                </div>

                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Información del Responsable</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable Legal</label>
                    <input
                        name="legal_representative"
                        type="text"
                        defaultValue={organization.legal_representative || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        placeholder="Nombre completo del responsable"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo del Responsable</label>
                    <input
                        name="representative_role"
                        type="text"
                        defaultValue={organization.representative_role || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        placeholder="Ej: Administrador, Contador"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono del Responsable</label>
                    <input
                        name="representative_phone"
                        type="text"
                        defaultValue={organization.representative_phone || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        placeholder="+58 4XX XXXX"
                    />
                </div>
            </div>

            {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    )
}
