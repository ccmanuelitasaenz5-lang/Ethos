'use client'

import { useState, useEffect } from 'react'
import { getBankAccounts } from '@/app/actions/bank'
import BankAccountForm from './BankAccountForm'
import BankTransactionList from './BankTransactionList'

interface BankDashboardClientProps {
    initialBankAccounts: any[]
    accountingAccounts: any[]
}

export default function BankDashboardClient({ initialBankAccounts, accountingAccounts }: BankDashboardClientProps) {
    const [bankAccounts, setBankAccounts] = useState(initialBankAccounts)
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
        initialBankAccounts.length > 0 ? initialBankAccounts[0].id : null
    )
    const [showAccountForm, setShowAccountForm] = useState(false)

    const refreshAccounts = async () => {
        const data = await getBankAccounts()
        setBankAccounts(data)
        if (data.length > 0 && !selectedAccountId) {
            setSelectedAccountId(data[0].id)
        }
    }

    const selectedAccount = bankAccounts.find(a => a.id === selectedAccountId)

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Lista de Cuentas */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tus Cuentas</h2>
                        <button
                            onClick={() => setShowAccountForm(!showAccountForm)}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700"
                        >
                            {showAccountForm ? 'Cancelar' : '+ Agregar'}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {bankAccounts.length === 0 ? (
                            <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                No tienes cuentas registradas.
                            </p>
                        ) : (
                            bankAccounts.map((account) => (
                                <button
                                    key={account.id}
                                    onClick={() => setSelectedAccountId(account.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedAccountId === account.id
                                        ? 'bg-primary-50 border-primary-200 shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-primary-100 hover:bg-gray-50'
                                        }`}
                                >
                                    <p className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">{account.account_name}</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs text-gray-500">{account.bank_name || 'Sin banco'}</p>
                                        <p className={`text-sm font-black ${account.current_balance < 0 ? 'text-red-600' : 'text-primary-700'}`}>
                                            {account.currency === 'USD' ? '$' : 'Bs.'} {account.current_balance?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Contenido Principal: Movimientos */}
                <div className="lg:col-span-3 space-y-6">
                    {showAccountForm && (
                        <BankAccountForm
                            accountingAccounts={accountingAccounts}
                            onSuccess={() => {
                                setShowAccountForm(false)
                                refreshAccounts()
                            }}
                        />
                    )}

                    {selectedAccountId ? (
                        <div className="space-y-6">
                            {selectedAccount && (
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">{selectedAccount.account_name}</h2>
                                        <p className="text-sm text-gray-500">{selectedAccount.bank_name} - {selectedAccount.accounting_accounts?.code ? `Cuenta contable: ${selectedAccount.accounting_accounts.code}` : ''}</p>

                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Saldo Disponible</p>
                                        <p className={`text-3xl font-black ${selectedAccount.current_balance < 0 ? 'text-red-600' : 'text-primary-800'}`}>
                                            {selectedAccount.currency === 'USD' ? '$' : 'Bs.'} {selectedAccount.current_balance?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <BankTransactionList bankAccountId={selectedAccountId} onUpdate={refreshAccounts} />
                        </div>
                    ) : !showAccountForm && (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center">
                            <p className="text-gray-500">Selecciona una cuenta para ver sus movimientos o crea una nueva.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
