'use client'

import { JournalEntry } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { ArrowDownTrayIcon, MagnifyingGlassIcon, PrinterIcon } from '@heroicons/react/24/outline'
import PrintHeader from '@/components/layout/PrintHeader'

interface JournalTableProps {
    entries: JournalEntry[]
    organizationName?: string
}

export default function JournalTable({ entries, organizationName = 'Organización' }: JournalTableProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredEntries = entries.filter(entry =>
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.account_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    function handleExport() {
        const data = entries.map(entry => ({
            'Asiento': entry.entry_number,
            'Fecha': format(new Date(entry.date), 'dd/MM/yyyy'),
            'Código Cuenta': entry.account_code,
            'Cuenta': entry.account_name,
            'Descripción': entry.description,
            'Debe': entry.debit,
            'Haber': entry.credit,
        }))

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(data)
        XLSX.utils.book_append_sheet(wb, ws, 'Libro Diario')
        XLSX.writeFile(wb, `Libro_Diario_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    }

    function handlePrint() {
        window.print()
    }

    return (
        <div className="space-y-4">
            <PrintHeader title="Libro Diario" organizationName={organizationName} />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                <div className="relative w-full sm:w-64">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar en diario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                        onClick={handlePrint}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                    >
                        <PrinterIcon className="h-5 w-5 mr-2 text-gray-500" />
                        PDF
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-green-600" />
                        Excel
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                        <tr>
                            <th className="px-4 py-3 text-left">Asiento</th>
                            <th className="px-4 py-3 text-left">Fecha</th>
                            <th className="px-4 py-3 text-left">Cuenta</th>
                            <th className="px-4 py-3 text-left">Descripción</th>
                            <th className="px-4 py-3 text-right">Debe</th>
                            <th className="px-4 py-3 text-right">Haber</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        {filteredEntries.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                    No hay asientos registrados
                                </td>
                            </tr>
                        ) : (
                            filteredEntries.map((entry, idx) => (
                                <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                        {entry.entry_number}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {format(new Date(entry.date), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-blue-700">{entry.account_code}</div>
                                        <div className="text-[10px] text-gray-400">{entry.account_name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                                        {entry.description}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-green-600">
                                        {entry.debit > 0 ? entry.debit.toLocaleString('es-VE', { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-red-600">
                                        {entry.credit > 0 ? entry.credit.toLocaleString('es-VE', { minimumFractionDigits: 2 }) : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                        <tr>
                            <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900">
                                TOTALES:
                            </td>
                            <td className="px-4 py-3 text-right font-bold font-mono text-green-700">
                                {filteredEntries.reduce((sum, e) => sum + (e.debit || 0), 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right font-bold font-mono text-red-700">
                                {filteredEntries.reduce((sum, e) => sum + (e.credit || 0), 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                        <tr className="bg-primary-50">
                            <td colSpan={4} className="px-4 py-2 text-right font-bold text-primary-900">
                                DIFERENCIA (Debe - Haber):
                            </td>
                            <td colSpan={2} className="px-4 py-2 text-center font-bold font-mono text-primary-700">
                                {(
                                    filteredEntries.reduce((sum, e) => sum + (e.debit || 0), 0) -
                                    filteredEntries.reduce((sum, e) => sum + (e.credit || 0), 0)
                                ).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            {filteredEntries.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                            <strong>Total de asientos:</strong> {filteredEntries.length}
                        </span>
                        <span className={`font-semibold ${
                            Math.abs(
                                filteredEntries.reduce((sum, e) => sum + (e.debit || 0), 0) -
                                filteredEntries.reduce((sum, e) => sum + (e.credit || 0), 0)
                            ) < 0.01
                                ? 'text-green-700'
                                : 'text-red-700'
                        }`}>
                            {Math.abs(
                                filteredEntries.reduce((sum, e) => sum + (e.debit || 0), 0) -
                                filteredEntries.reduce((sum, e) => sum + (e.credit || 0), 0)
                            ) < 0.01
                                ? '✓ Partida Doble Balanceada'
                                : '⚠ Partida Doble Desbalanceada'
                            }
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
