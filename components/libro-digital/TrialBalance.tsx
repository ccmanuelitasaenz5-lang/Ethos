'use client'

import { JournalEntry } from '@/types/database'

interface TrialBalanceProps {
    entries: JournalEntry[]
}

export default function TrialBalance({ entries }: TrialBalanceProps) {
    // Simple aggregation for total check
    const totals = entries.reduce((acc, entry) => {
        acc.debit += entry.debit
        acc.credit += entry.credit
        return acc
    }, { debit: 0, credit: 0 })

    const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01

    return (
        <div className="space-y-6">
            <div className={`p-4 rounded-lg border flex items-center justify-between ${isBalanced ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
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
