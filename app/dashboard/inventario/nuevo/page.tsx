import AssetForm from '@/components/inventario/AssetForm'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function NuevoActivoPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/inventario"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Volver
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Activo</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Registra un nuevo activo fijo en el inventario
                </p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6">
                <AssetForm />
            </div>
        </div>
    )
}
