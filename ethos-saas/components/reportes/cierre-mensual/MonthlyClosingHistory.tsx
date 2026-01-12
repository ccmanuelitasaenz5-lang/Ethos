'use client'

import { useState, useEffect } from 'react'
import { getMonthlyClosings, reopenMonthlyClosing } from '@/app/actions/closing'

export default function MonthlyClosingHistory() {
    const [year, setYear] = useState(new Date().getFullYear())
    const [closings, setClosings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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
                                <tr key={closing.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 capitalize">
                                        {formatDate(closing.period)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(closing.closed_at).toLocaleDateString('es-VE')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                            closing.status === 'closed' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                        }`}>
                                            {closing.status === 'closed' ? 'CERRADO' : 'REABIERTO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs" title={closing.notes}>
                                        {closing.notes || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {closing.status === 'closed' && (
                                            <button
                                                onClick={() => handleReopen(closing.id)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                            >
                                                Reabrir
                                            </button>
                                        )}
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
