import { Metadata } from 'next'
import UserList from '@/components/settings/UserList'

export const metadata: Metadata = {
    title: 'Gestión de Usuarios | Ethos',
    description: 'Administra los accesos y roles de tu organización',
}

export default function UsersPage() {
    return (
        <div className="max-w-5xl mx-auto pb-12 text-gray-900">
            <div className="border-b border-gray-200 pb-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="mt-2 text-gray-600">
                    Controla quién puede acceder, editar o auditar la contabilidad de tu condominio.
                </p>
            </div>

            <UserList />
        </div>
    )
}
