'use client'

import { useState } from 'react'
import { inviteUser } from '@/app/actions/users'

interface InviteUserFormProps {
    onSuccess: () => void
    onCancel: () => void
}

export default function InviteUserForm({ onSuccess, onCancel }: InviteUserFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await inviteUser(formData)

        if (result?.error) {
            setError(result.error)
        } else {
            onSuccess()
            // Form is unmounted by parent on success usually, but if not we could reset
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invitar Nuevo Usuario</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                        name="full_name"
                        required
                        placeholder="Ej: Juan Pérez"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="usuario@email.com"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select
                        name="role"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="resident">Residente / Propietario</option>
                        <option value="auditor">Auditor (Solo Lectura)</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando Invitación...
                        </>
                    ) : 'Enviar Invitación'}
                </button>
            </div>
        </form>
    )
}
