'use client'

import { Organization, TransactionIncome, TransactionExpense } from '@/types/database'
import { ArrowDownTrayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { generateBackup, generateCSVBackup } from '@/lib/export/backup'
import { exportFinancialSummary } from '@/lib/export/excel'

interface BackupManagerProps {
    organization: Organization
    incomes: TransactionIncome[]
    expenses: TransactionExpense[]
}

export default function BackupManager({ organization, incomes, expenses }: BackupManagerProps) {
    const handleJSONBackup = () => {
        generateBackup(organization, incomes, expenses)
    }

    const handleCSVBackup = () => {
        generateCSVBackup(incomes, expenses, organization.name)
    }

    const handleExcelBackup = () => {
        exportFinancialSummary(incomes, expenses, organization.name)
    }

    const totalRecords = incomes.length + expenses.length

    return (
        <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Respaldo de Datos</h2>

            <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                    Descarga una copia completa de todos tus datos para mantener un respaldo seguro.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                        <span className="font-medium">Total de registros:</span> {totalRecords} transacciones
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                        <span className="font-medium">Ingresos:</span> {incomes.length} |
                        <span className="font-medium ml-2">Gastos:</span> {expenses.length}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* JSON Backup */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900 flex items-center">
                                <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Respaldo Completo (JSON)
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Descarga todos tus datos en formato JSON. Incluye organización, ingresos, gastos y metadatos.
                            </p>
                            <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Recomendado para respaldo
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleJSONBackup}
                            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Descargar JSON
                        </button>
                    </div>
                </div>

                {/* CSV Backup */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900 flex items-center">
                                <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-green-600" />
                                Respaldo CSV
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Descarga tus datos en formato CSV (2 archivos: ingresos y gastos). Compatible con Excel y otras aplicaciones.
                            </p>
                            <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Compatible con Excel
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleCSVBackup}
                            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Descargar CSV
                        </button>
                    </div>
                </div>

                {/* Excel Backup */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-900 flex items-center">
                                <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                Resumen Excel
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Descarga un archivo Excel con 3 hojas: Resumen financiero, Ingresos y Gastos. Ideal para reportes.
                            </p>
                            <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Formato profesional
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleExcelBackup}
                            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Descargar Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Recomendaciones</h4>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Realiza respaldos periódicamente (semanal o mensual)</li>
                    <li>Guarda los archivos en un lugar seguro (nube o disco externo)</li>
                    <li>El formato JSON es el más completo para restauración futura</li>
                    <li>Verifica que los archivos descargados contengan todos tus datos</li>
                </ul>
            </div>
        </div>
    )
}
