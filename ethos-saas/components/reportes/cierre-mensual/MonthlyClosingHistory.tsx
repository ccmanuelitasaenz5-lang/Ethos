'use client'

import React, { useState, useEffect } from 'react'
import { getMonthlyClosings, reopenMonthlyClosing, getClosingReports } from '@/app/actions/closing'

export default function MonthlyClosingHistory() {
    const [year, setYear] = useState(new Date().getFullYear())
    const [closings, setClosings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [reportsCache, setReportsCache] = useState<Record<string, any[]>>({})
    const [reportsLoading, setReportsLoading] = useState<string | null>(null)

    useEffect(() => {
        loadClosings()
    }, [year])

    const loadClosings = async () => {
        setLoading(true)
        const data = await getMonthlyClosings(year)
        setClosings(data || [])
        setLoading(false)
    }

    const handleReopen = async (id: string) => {
        if (!confirm('¿Estás seguro de reabrir este mes? Esto permitirá modificar transacciones nuevamente.')) return

        const result = await reopenMonthlyClosing(id)
        if (result?.error) {
            alert(result.error)
        } else {
            loadClosings()
        }
    }

    const toggleExpand = async (closingId: string) => {
        if (expandedId === closingId) {
            setExpandedId(null)
            return
        }

        setExpandedId(closingId)

        if (!reportsCache[closingId]) {
            setReportsLoading(closingId)
            try {
                const reports = await getClosingReports(closingId)
                setReportsCache(prev => ({ ...prev, [closingId]: reports }))
            } catch (err) {
                console.error('Error loading reports:', err)
            } finally {
                setReportsLoading(null)
            }
        }
    }

    const getReportTypeName = (type: string) => {
        const names: Record<string, string> = {
            'journal': 'Libro Diario',
            'ledger': 'Libro Mayor',
            'expense': 'Relación de Gastos',
            'property-statement': 'Aviso de Cobro',
            'balance': 'Balance de Comprobación',
            'income-statement': 'Estado de Resultados'
        }
        return names[type] || type
    }

    const formatDate = (dateString: string) => {
        // Handle timezone issues by treating dateString as local or splitting parts manually
        // Since input is YYYY-MM-DD from database date column (usually)
        if (!dateString) return '-'

        // dateString format is likely YYYY-MM-DD
        const parts = dateString.split('-')
        if (parts.length === 3) {
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
            return date.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' })
        }
        return dateString
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Historial de Cierres</h2>
                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Año:</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Periodo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Cierre</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Notas</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Cargando historial...</td></tr>
                        ) : closings.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">No hay cierres registrados para el año {year}.</td></tr>
                        ) : (
                            closings.map((closing) => (
                                <React.Fragment key={closing.id}>
                                    <tr className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedId === closing.id ? 'bg-primary-50' : ''}`} onClick={() => toggleExpand(closing.id)}>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 capitalize flex items-center">
                                            <svg className={`w-4 h-4 mr-2 transition-transform ${expandedId === closing.id ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            {formatDate(closing.period)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(closing.closed_at).toLocaleDateString('es-VE')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${closing.status === 'closed' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                }`}>
                                                {closing.status === 'closed' ? 'CERRADO' : 'REABIERTO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs" title={closing.notes}>
                                            {closing.notes || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center space-x-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(closing.id); }}
                                                    className="text-primary-600 hover:text-primary-900 border border-primary-200 px-3 py-1 rounded-md transition-colors"
                                                >
                                                    {expandedId === closing.id ? 'Ocultar' : 'Ver Reportes'}
                                                </button>
                                                {closing.status === 'closed' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleReopen(closing.id); }}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                                    >
                                                        Reabrir
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedId === closing.id && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={5} className="px-12 py-6 border-l-4 border-primary-500">
                                                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Reportes PDF Generados al Cierre</h4>

                                                {reportsLoading === closing.id ? (
                                                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        <span>Cargando reportes...</span>
                                                    </div>
                                                ) : reportsCache[closing.id]?.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        {reportsCache[closing.id].map((report) => (
                                                            <div key={report.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between hover:border-primary-300 transition-colors">
                                                                <div>
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M10 2a2 2 0 00-2 2v12a2 2 0 002 2h5a2 2 0 002-2V7.414A2 2 0 0016.414 6L13 2.586A2 2 0 0011.586 2H10z" />
                                                                        </svg>
                                                                        <span className="text-xs font-bold text-gray-500 uppercase">{report.report_type}</span>
                                                                    </div>
                                                                    <h5 className="text-sm font-bold text-gray-900 mb-1">{getReportTypeName(report.report_type)}</h5>
                                                                    <p className="text-xs text-gray-500 mb-4">Size: {(report.file_size / 1024).toFixed(1)} KB</p>
                                                                </div>
                                                                <a
                                                                    href={report.publicUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-center px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded hover:bg-primary-700 transition-colors flex items-center justify-center"
                                                                >
                                                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                    Descargar PDF
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">No se encontraron reportes PDF guardados para este cierre. Es posible que el cierre se haya realizado antes de habilitar esta funcionalidad.</p>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
