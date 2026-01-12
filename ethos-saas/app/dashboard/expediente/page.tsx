import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import DocumentList from '@/components/expediente/DocumentList'

export default async function ExpedientePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user?.id)
        .maybeSingle()

    const organizationId = userData?.organization_id

    const { data: documents } = organizationId
        ? await supabase
            .from('documents')
            .select('*')
            .eq('organization_id', organizationId)
            .order('uploaded_at', { ascending: false })
        : { data: [] }

    // Calculate total storage used
    const totalSize = documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Expediente Digital</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Gestión de documentos y archivos de la organización
                    </p>
                </div>
                <Link
                    href="/dashboard/expediente/subir"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Subir Documento
                </Link>
            </div>

            {/* Summary Card */}
            <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Total de Documentos</p>
                        <p className="mt-1 text-3xl font-bold text-primary-600">
                            {documents?.length || 0}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Espacio Utilizado</p>
                        <p className="mt-1 text-3xl font-bold text-blue-600">
                            {totalSizeMB} MB
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Límite de Almacenamiento</p>
                        <p className="mt-1 text-3xl font-bold text-gray-600">
                            1 GB
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {((parseFloat(totalSizeMB) / 1024) * 100).toFixed(1)}% usado
                        </p>
                    </div>
                </div>
            </div>

            <DocumentList documents={documents || []} />
        </div>
    )
}
