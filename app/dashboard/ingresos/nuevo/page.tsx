import IncomeForm from '@/components/ingresos/IncomeForm'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getBCVRate } from '@/lib/exchange'
import { getChartOfAccounts } from '@/app/actions/accounting'
import { getProperties } from '@/app/actions/organization'

export default async function NuevoIngresoPage() {
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
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Ingreso</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Registra un nuevo recibo o entrada de dinero
                </p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6">
                <IncomeForm initialRate={bcvRate} accounts={accounts} properties={properties} />
            </div>
        </div>
    )
}
