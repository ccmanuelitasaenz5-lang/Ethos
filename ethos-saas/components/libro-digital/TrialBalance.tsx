'use client'

import { JournalEntry } from '@/types/database'

interface TrialBalanceProps {
    entries: JournalEntry[]
    onNewEntry?: () => void
}

export default function TrialBalance({ entries, onNewEntry }: TrialBalanceProps) {
    // Simple aggregation for total check
    const totals = entries.reduce((acc, entry) => {
        acc.debit += entry.debit
        acc.credit += entry.credit
        return acc
    }, { debit: 0, credit: 0 })

    const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print pb-2">
                <h3 className="text-lg font-bold text-gray-900">Balance de Comprobación</h3>
                <div className="flex space-x-2 w-full sm:w-auto">
                    {onNewEntry && (
                        <button
                            onClick={onNewEntry}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg shadow-sm text-sm font-bold hover:bg-primary-700 transition-all active:scale-95"
                        >
                            + Nuevo Asiento
                        </button>
                    )}
                </div>
            </div>

            <div className={`p-5 rounded-xl border flex items-center justify-between ${isBalanced ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isBalanced ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="font-semibold uppercase tracking-wider text-xs">
                        Estado del Balance: {isBalanced ? 'Cuadrado ✅' : 'Descuadrado ❌'}
                    </span>
                </div>
                <div className="text-lg font-mono font-bold">
                    Diferencia: ${(totals.debit - totals.credit).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <h4 className="text-sm font-medium text-blue-700 uppercase mb-2">Total Sumas Debe</h4>
                    <p className="text-3xl font-bold text-blue-900 font-mono">
                        ${totals.debit.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
                    <h4 className="text-sm font-medium text-orange-700 uppercase mb-2">Total Sumas Haber</h4>
                    <p className="text-3xl font-bold text-orange-900 font-mono">
                        ${totals.credit.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center text-gray-500 text-xs">
                <p>El Balance de Comprobación asegura que todos los créditos y débitos estén registrados correctamente.</p>
                <p className="mt-1 italic">VEN-NIF / Contabilidad Venezolana</p>
            </div>
        </div>
    )
}
