import DocumentUploadForm from '@/components/expediente/DocumentUploadForm'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function SubirDocumentoPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/expediente"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Volver
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-gray-900">Subir Documento</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Agrega un nuevo documento al expediente digital
                </p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6">
                <DocumentUploadForm />
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Información</h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Tamaño máximo por archivo: 10 MB</li>
                    <li>Formatos permitidos: PDF, Word, Excel, imágenes (JPG, PNG)</li>
                    <li>Los documentos se almacenan de forma segura en Supabase Storage</li>
                    <li>Solo los miembros de tu organización pueden ver estos documentos</li>
                </ul>
            </div>
        </div>
    )
}
