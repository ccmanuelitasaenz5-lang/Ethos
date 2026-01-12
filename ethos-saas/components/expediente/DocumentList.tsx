'use client'

import { Document } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    TrashIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon,
    DocumentIcon,
    PhotoIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline'
import { deleteDocument } from '@/app/actions/documents'
import { useState } from 'react'

interface DocumentListProps {
    documents: Document[]
}

export default function DocumentList({ documents }: DocumentListProps) {
    const [deleting, setDeleting] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    async function handleDelete(id: string, fileUrl: string) {
        if (!confirm('¿Estás seguro de eliminar este documento?')) return

        setDeleting(id)
        await deleteDocument(id, fileUrl)
        setDeleting(null)
    }

    function getFileIcon(mimeType: string | null) {
        if (!mimeType) return DocumentIcon

        if (mimeType.includes('pdf')) return DocumentTextIcon
        if (mimeType.includes('image')) return PhotoIcon
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return TableCellsIcon
        return DocumentIcon
    }

    function formatFileSize(bytes: number | null): string {
        if (!bytes) return '0 KB'

        const kb = bytes / 1024
        if (kb < 1024) return `${kb.toFixed(1)} KB`

        const mb = kb / 1024
        return `${mb.toFixed(2)} MB`
    }

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Documentos ({filteredDocuments.length})
                    </h3>
                    <input
                        type="text"
                        placeholder="Buscar documentos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            </div>

            {filteredDocuments.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron documentos' : 'No hay documentos registrados'}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    {filteredDocuments.map((doc) => {
                        const FileIcon = getFileIcon(doc.mime_type)

                        return (
                            <div
                                key={doc.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <FileIcon className="h-8 w-8 text-primary-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                {doc.title}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(doc.file_size)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {doc.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {doc.description}
                                    </p>
                                )}

                                <div className="text-xs text-gray-500 mb-3">
                                    Subido: {format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </div>

                                <div className="flex space-x-2">
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                        Descargar
                                    </a>
                                    <button
                                        onClick={() => handleDelete(doc.id, doc.file_url)}
                                        disabled={deleting === doc.id}
                                        className="inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-lg text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                        title="Eliminar"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
