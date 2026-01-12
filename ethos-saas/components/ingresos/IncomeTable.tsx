'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TransactionIncome } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TrashIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { deleteIncome } from '@/app/actions/income'
import { exportIncomeToExcel } from '@/lib/export/excel'
import PrintHeader from '@/components/layout/PrintHeader'
import Pagination from '@/components/shared/Pagination'
import EmptyState from '@/components/shared/EmptyState'
import { toast } from 'react-hot-toast'
import { getTotalPages } from '@/lib/pagination'

interface IncomeTableProps {
    incomes: TransactionIncome[]
    organizationName?: string
    totalItems: number
    currentPage: number
    itemsPerPage: number
}

export default function IncomeTable({ 
    incomes, 
    organizationName = 'Organización',
    totalItems,
    currentPage,
    itemsPerPage
}: IncomeTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [deleting, setDeleting] = useState<string | null>(null)
    const [filterMethod, setFilterMethod] = useState<string>('all')
    const [minAmount, setMinAmount] = useState<string>('')

    const totalPages = getTotalPages(totalItems, itemsPerPage)

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este ingreso?')) return

        setDeleting(id)
        const result = await deleteIncome(id)
        setDeleting(null)
        
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('Ingreso eliminado correctamente')
            router.refresh()
        }
    }

    function handlePageChange(page: number) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', page.toString())
        router.push(`/dashboard/ingresos?${params.toString()}`)
    }

    const filteredIncomes = incomes.filter(income => {
        const matchesMethod = filterMethod === 'all' || income.payment_method === filterMethod
        const matchesAmount = minAmount === '' || (income.amount_usd || 0) >= parseFloat(minAmount)
        return matchesMethod && matchesAmount
    })

    function handleExport() {
        exportIncomeToExcel(filteredIncomes, organizationName)
    }

    function handlePrint() {
        window.print()
    }

    return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <PrintHeader title="Reporte de Ingresos" organizationName={organizationName} />

            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 no-print bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        className="text-xs border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                        <option value="all">Todos los métodos</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="pago_movil">Pago Móvil</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Monto min $"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="text-xs border-gray-300 rounded-lg w-24 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {filteredIncomes.length} resultados
                    </span>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <PrinterIcon className="h-4 w-4 mr-2 text-gray-500" />
                        PDF
                    </button>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Excel
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Recibo #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                N° Control
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Concepto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Monto USD
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Monto VES
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Método de Pago
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estatus
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {incomes.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-8">
                                    <EmptyState 
                                        title="No hay ingresos registrados"
                                        message="Comienza agregando tu primer ingreso usando el botón 'Nuevo Ingreso'"
                                    />
                                </td>
                            </tr>
                        ) : (
                            incomes.map((income) => (
                                <tr key={income.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {format(new Date(income.date), 'dd/MM/yyyy', { locale: es })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {income.receipt_number || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {income.control_number || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {income.concept}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                        ${income.amount_usd?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                        {income.amount_ves
                                            ? `Bs. ${income.amount_ves.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : '-'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {income.payment_method?.replace('_', ' ') || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${income.status === 'finalized' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {income.status === 'finalized' ? 'Finalizado' : 'Borrador'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(income.id)}
                                            disabled={deleting === income.id}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                            title="Eliminar"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    )
}
