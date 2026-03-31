import ExpenseForm from '@/components/gastos/ExpenseForm'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getBCVRate } from '@/lib/exchange'
import { getChartOfAccounts } from '@/app/actions/accounting'
import { getExpense } from '@/app/actions/expense'
import { notFound } from 'next/navigation'

export default async function EditarGastoPage({ params }: { params: { id: string } }) {
    const { id } = params
    const bcvRate = await getBCVRate()
    const accounts = await getChartOfAccounts()
    const expense = await getExpense(id)

    if (!expense) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/gastos"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Volver
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Gasto</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Modifica los detalles del gasto (solo si está en borrador)
                </p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6">
                <ExpenseForm initialRate={bcvRate} accounts={accounts} initialData={expense} />
            </div>
        </div>
    )
}
