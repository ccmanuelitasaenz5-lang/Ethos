import { Metadata } from 'next'
import { getBankAccounts } from '@/app/actions/bank'
import { getChartOfAccounts } from '@/app/actions/accounting'
import BankDashboardClient from '@/components/bank/BankDashboardClient'

export const metadata: Metadata = {
    title: 'Banco | Ethos',
    description: 'Gestión de cuentas bancarias y conciliación',
}

export default async function BankPage() {
    const bankAccounts = await getBankAccounts()
    const allAccounts = await getChartOfAccounts()

    // Filtrar cuentas contables que son de tipo ACTIVO y son de movimiento para el selector
    const accountingAccounts = allAccounts.filter(a => a.main_type === 'ASSET' && a.is_movement)

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 text-gray-900">
            <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Módulo Bancario</h1>
                    <p className="mt-2 text-gray-600">
                        Administra tus cuentas bancarias, registra movimientos y realiza conciliaciones.
                    </p>
                </div>
            </div>

            <BankDashboardClient
                initialBankAccounts={bankAccounts}
                accountingAccounts={accountingAccounts}
            />
        </div>
    )
}
