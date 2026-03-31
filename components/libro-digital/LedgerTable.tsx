'use client'

import { JournalEntry } from '@/types/database'
import { useState } from 'react'

interface LedgerTableProps {
    entries: JournalEntry[]
}

export default function LedgerTable({ entries }: LedgerTableProps) {
    // Aggregate by account code
    const accountsMap = entries.reduce((acc, entry) => {
        if (!acc[entry.account_code]) {
            acc[entry.account_code] = {
                code: entry.account_code,
                name: entry.account_name,
                debit: 0,
                credit: 0,
                balance: 0
            }
        }
        acc[entry.account_code].debit += entry.debit
        acc[entry.account_code].credit += entry.credit
        // Balance calculation (Assets/Expenses: Debit - Credit, Liabilities/Equity/Income: Credit - Debit)
        // Simplified: Debit - Credit (Trial Balance style)
        acc[entry.account_code].balance = acc[entry.account_code].debit - acc[entry.account_code].credit
        return acc
    }, {} as Record<string, any>)

    const accounts = Object.values(accountsMap).sort((a, b) => a.code.localeCompare(b.code))

    return (
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                    <tr>
                        <th className="px-4 py-3 text-left">Código</th>
                        <th className="px-4 py-3 text-left">Cuenta</th>
                        <th className="px-4 py-3 text-right">Sumas Debe</th>
                        <th className="px-4 py-3 text-right">Sumas Haber</th>
                        <th className="px-4 py-3 text-right">Saldo Neto</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {accounts.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                No hay datos para mostrar
                            </td>
                        </tr>
                    ) : (
                        accounts.map((acc) => (
                            <tr key={acc.code} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-gray-900">{acc.code}</td>
                                <td className="px-4 py-3 font-medium text-gray-700">{acc.name}</td>
                                <td className="px-4 py-3 text-right font-mono">${acc.debit.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-right font-mono">${acc.credit.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                                <td className={`px-4 py-3 text-right font-bold font-mono ${acc.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${Math.abs(acc.balance).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                    <span className="text-[10px] ml-1">{acc.balance >= 0 ? 'Dt' : 'Cr'}</span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
