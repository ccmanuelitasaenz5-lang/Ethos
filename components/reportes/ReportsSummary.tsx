'use client'

import { TransactionIncome, TransactionExpense } from '@/types/database'
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { exportFinancialSummary } from '@/lib/export/excel'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import PrintHeader from '@/components/layout/PrintHeader'

interface ReportsSummaryProps {
    incomes: TransactionIncome[]
    expenses: TransactionExpense[]
    organizationName: string
}

export default function ReportsSummary({ incomes, expenses, organizationName }: ReportsSummaryProps) {
    const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter'>('all')

    // Filter data based on date range
    const filterByDateRange = () => {
        const now = new Date()
        let startDate: Date

        switch (dateRange) {
            case 'month':
                startDate = startOfMonth(now)
                break
            case 'quarter':
                startDate = startOfMonth(subMonths(now, 3))
                break
            default:
                return { filteredIncomes: incomes, filteredExpenses: expenses }
        }

        const endDate = endOfMonth(now)

        return {
            filteredIncomes: incomes.filter(i => {
                const date = new Date(i.date)
                return date >= startDate && date <= endDate
            }),
            filteredExpenses: expenses.filter(e => {
                const date = new Date(e.date)
                return date >= startDate && date <= endDate
            })
        }
    }

    const { filteredIncomes, filteredExpenses } = filterByDateRange()

    // Calculate totals
    const totalIncomeUSD = filteredIncomes.reduce((sum, t) => sum + (t.amount_usd || 0), 0)
    const totalIncomeVES = filteredIncomes.reduce((sum, t) => sum + (t.amount_ves || 0), 0)

    const totalExpenseUSD = filteredExpenses.reduce((sum, t) => sum + (t.amount_usd || 0), 0)
    const totalExpenseVES = filteredExpenses.reduce((sum, t) => sum + (t.amount_ves || 0), 0)

    const balanceUSD = totalIncomeUSD - totalExpenseUSD
    const balanceVES = totalIncomeVES - totalExpenseVES

    // Calculate by category
    const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
        const category = expense.category || 'Sin categoría'
        if (!acc[category]) {
            acc[category] = 0
        }
        acc[category] += expense.amount_usd || 0
        return acc
    }, {} as Record<string, number>)

    const handleExport = () => {
        exportFinancialSummary(filteredIncomes, filteredExpenses, organizationName)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-6">
            <PrintHeader
                title={`Reporte Financiero - ${dateRange === 'all' ? 'Histórico' : dateRange === 'month' ? 'Mensual' : 'Trimestral'}`}
                organizationName={organizationName}
            />

            {/* Filter and Export */}
            <div className="bg-white shadow-lg rounded-xl p-6 no-print">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setDateRange('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === 'all'
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setDateRange('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === 'month'
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Este Mes
                        </button>
                        <button
                            onClick={() => setDateRange('quarter')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === 'quarter'
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Último Trimestre
                        </button>
                    </div>

                    <div className="flex space-x-3 w-full sm:w-auto">
                        <button
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <PrinterIcon className="h-5 w-5 mr-2 text-gray-500" />
                            PDF / Imprimir
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-500">Ingresos Totales</h3>
                    <div className="mt-2">
                        <p className="text-3xl font-bold text-green-600">
                            ${totalIncomeUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Bs. {totalIncomeVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {filteredIncomes.length} transacciones
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-500">Gastos Totales</h3>
                    <div className="mt-2">
                        <p className="text-3xl font-bold text-red-600">
                            ${totalExpenseUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Bs. {totalExpenseVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {filteredExpenses.length} transacciones
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-500">Balance</h3>
                    <div className="mt-2">
                        <p className={`text-3xl font-bold ${balanceUSD >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            ${balanceUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Bs. {balanceVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {balanceUSD >= 0 ? 'Superávit' : 'Déficit'}
                    </p>
                </div>
            </div>

            {/* Expenses by Category */}
            {Object.keys(expensesByCategory).length > 0 && (
                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoría</h3>
                    <div className="space-y-3">
                        {Object.entries(expensesByCategory)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, amount]) => {
                                const percentage = (amount / totalExpenseUSD) * 100
                                return (
                                    <div key={category}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-700">{category}</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% del total</p>
                                    </div>
                                )
                            })}
                    </div>
                </div>
            )}

            {/* Monthly Trend (simplified) */}
            <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Período</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Período</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {dateRange === 'all' ? 'Histórico' : dateRange === 'month' ? 'Este Mes' : 'Último Trimestre'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Promedio Ingreso</p>
                        <p className="text-lg font-semibold text-green-600">
                            ${filteredIncomes.length > 0 ? (totalIncomeUSD / filteredIncomes.length).toFixed(2) : '0.00'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Promedio Gasto</p>
                        <p className="text-lg font-semibold text-red-600">
                            ${filteredExpenses.length > 0 ? (totalExpenseUSD / filteredExpenses.length).toFixed(2) : '0.00'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Transacciones</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {filteredIncomes.length + filteredExpenses.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
