'use client'

import { useState, useEffect } from 'react'
import JournalTable from '@/components/libro-digital/JournalTable'
import LedgerTable from '@/components/libro-digital/LedgerTable'
import TrialBalance from '@/components/libro-digital/TrialBalance'
import ManualEntryModal from '@/components/libro-digital/ManualEntryModal'
import { JournalEntry, TransactionAccount } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { createManualJournalEntry } from '@/app/actions/accounting'
import { toast } from 'react-hot-toast'

export default function LibroDigitalPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [accounts, setAccounts] = useState<TransactionAccount[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [orgName, setOrgName] = useState('Organización')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'diario' | 'mayor' | 'balance'>('diario')

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            const { data: userData } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', user?.id)
                .single()

            if (userData?.organization_id) {
                // Fetch organization name
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('name')
                    .eq('id', userData.organization_id)
                    .single()

                if (orgData) setOrgName(orgData.name)

                const { data } = await supabase
                    .from('journal_entries')
                    .select('*')
                    .eq('organization_id', userData.organization_id)
                    .order('date', { ascending: false })
                    .order('entry_number', { ascending: false })

                setEntries(data || [])

                const { data: accountsData } = await supabase
                    .from('accounting_accounts')
                    .select('*')
                    .eq('organization_id', userData.organization_id)
                    .order('code', { ascending: true })

                setAccounts(accountsData as TransactionAccount[] || [])
            }
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="p-8 text-center bg-white shadow-lg rounded-xl flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Cargando libros contables...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end flex-wrap gap-4 px-2 sm:px-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Libro Digital</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Contabilidad por Partida Doble - Libro Diario y Mayor con Balance de Comprobación
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    + Nuevo Asiento Contable
                </button>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="border-b border-gray-200 bg-gray-50/50">
                    <nav className="flex px-4 overflow-x-auto no-scrollbar">
                        <TabButton
                            active={activeTab === 'diario'}
                            onClick={() => setActiveTab('diario')}
                            label="Libro Diario"
                            icon="📖"
                        />
                        <TabButton
                            active={activeTab === 'mayor'}
                            onClick={() => setActiveTab('mayor')}
                            label="Libro Mayor"
                            icon="📒"
                        />
                        <TabButton
                            active={activeTab === 'balance'}
                            onClick={() => setActiveTab('balance')}
                            label="Balance de Comprobación"
                            icon="⚖️"
                        />
                    </nav>
                </div>

                <div className="p-4 sm:p-8 min-h-[400px]">
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'diario' && (
                            <JournalTable 
                                entries={entries} 
                                organizationName={orgName} 
                                onNewEntry={() => setIsModalOpen(true)} 
                            />
                        )}
                        {activeTab === 'mayor' && (
                            <LedgerTable 
                                entries={entries} 
                                onNewEntry={() => setIsModalOpen(true)}
                            />
                        )}
                        {activeTab === 'balance' && (
                            <TrialBalance 
                                entries={entries} 
                                onNewEntry={() => setIsModalOpen(true)}
                            />
                        )}
                    </div>
                </div>
            </div>

            <ManualEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                accounts={accounts}
                onSave={async (payload) => {
                    const res = await createManualJournalEntry(payload)
                    if (res?.error) {
                        return { error: res.error }
                    } else {
                        toast.success('Asiento registrado con éxito')
                        setTimeout(() => window.location.reload(), 1000)
                        return { success: true }
                    }
                }}
            />
        </div>
    )
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: string }) {
    return (
        <button
            onClick={onClick}
            className={`
        px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap
        ${active
                    ? 'border-primary-600 text-primary-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }
      `}
        >
            <span className="text-lg">{icon}</span>
            {label}
        </button>
    )
}
