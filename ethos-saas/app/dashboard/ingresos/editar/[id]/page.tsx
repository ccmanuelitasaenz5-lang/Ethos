import IncomeForm from '@/components/ingresos/IncomeForm'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getBCVRate } from '@/lib/exchange'
import { getChartOfAccounts } from '@/app/actions/accounting'
import { getProperties } from '@/app/actions/organization'
import { getIncome } from '@/app/actions/income'
import { notFound } from 'next/navigation'

interface EditIncomePageProps {
    params: {
        id: string
    }
}

export default async function EditarIngresoPage({ params }: EditIncomePageProps) {
    const { id } = params
    const income = await getIncome(id)

    if (!income) {
        notFound()
    }

    if (income.status === 'finalized') {
        return (
            <div className="p-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Este ingreso ya ha sido finalizado</h2>
                <p className="mt-2 text-gray-600">No es posible editar ingresos que ya han sido fiscalizados.</p>
                <Link href="/dashboard/ingresos" className="mt-6 inline-flex text-primary-600 font-bold hover:underline">
                    Volver a ingresos
                </Link>
            </div>
        )
    }

    const bcvRate = await getBCVRate()
    const accounts = await getChartOfAccounts()
    const properties = await getProperties()

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/ingresos"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Volver
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Ingreso</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Modificando el ingreso en borrador
                </p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6">
                <IncomeForm
                    initialRate={bcvRate}
                    accounts={accounts}
                    properties={properties}
                    initialData={income}
                />
            </div>
        </div>
    )
}
