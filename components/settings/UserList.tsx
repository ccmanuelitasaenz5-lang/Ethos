'use client'

import { useState, useEffect } from 'react'
import { getOrganizationUsers, removeUser, updateUserRole, UserRole } from '@/app/actions/users'
import InviteUserForm from './InviteUserForm'

export default function UserList() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showInviteForm, setShowInviteForm] = useState(false)

    const loadUsers = async () => {
        setLoading(true)
        const data = await getOrganizationUsers()
        setUsers(data)
        setLoading(false)
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        // Optimistic update could be done here, but let's just wait for server response for safety
        const result = await updateUserRole(userId, newRole)
        if (result?.error) {
            alert(result.error)
        } else {
            loadUsers()
        }
    }

    const handleDelete = async (userId: string) => {
        if (!confirm('¿Estás seguro de eliminar este usuario? Perderá acceso a la organización.')) return

        const result = await removeUser(userId)
        if (result?.error) {
            alert(result.error)
        } else {
            loadUsers()
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Usuarios y Permisos</h3>
                    <p className="text-sm text-gray-500">Administra quién tiene acceso a la contabilidad.</p>
                </div>
                <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
                >
                    {showInviteForm ? 'Cancelar' : 'Invitar Usuario'}
                </button>
            </div>

            {showInviteForm && (
                <InviteUserForm
                    onSuccess={() => {
                        setShowInviteForm(false)
                        loadUsers()
                    }}
                    onCancel={() => setShowInviteForm(false)}
                />
            )}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Cargando usuarios...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay usuarios encontrados.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.full_name || 'Sin nombre'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className={`block w-full pl-3 pr-8 py-1 text-xs border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md ${
                                                user.role === 'admin' ? 'font-bold text-primary-700' : 'text-gray-700'
                                            }`}
                                        >
                                            <option value="admin">Administrador</option>
                                            <option value="auditor">Auditor</option>
                                            <option value="resident">Residente</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('es-VE')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900 font-bold hover:bg-red-50 px-3 py-1 rounded transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
