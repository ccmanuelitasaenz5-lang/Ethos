'use client'

import { useState } from 'react'
import { uploadDocument } from '@/app/actions/documents'
import { useRouter } from 'next/navigation'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

export default function DocumentUploadForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await uploadDocument(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push('/dashboard/expediente')
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size
            if (file.size > 10 * 1024 * 1024) {
                setError('El archivo no puede superar 10MB')
                setSelectedFile(null)
                e.target.value = ''
                return
            }
            setSelectedFile(file)
            setError(null)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título del Documento *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: Acta de Asamblea - Enero 2026"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descripción (Opcional)
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Breve descripción del documento..."
                />
            </div>

            <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                    <div className="space-y-1 text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <label
                                htmlFor="file"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                            >
                                <span>Seleccionar archivo</span>
                                <input
                                    id="file"
                                    name="file"
                                    type="file"
                                    required
                                    onChange={handleFileChange}
                                    className="sr-only"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">
                            PDF, Word, Excel, Imágenes hasta 10MB
                        </p>
                        {selectedFile && (
                            <p className="text-sm text-green-600 font-medium mt-2">
                                ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading || !selectedFile}
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Subiendo...' : 'Subir Documento'}
                </button>
            </div>
        </form>
    )
}
