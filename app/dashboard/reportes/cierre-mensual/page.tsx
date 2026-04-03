import { Metadata } from 'next'
import MonthlyClosingWizard from '@/components/reportes/cierre-mensual/MonthlyClosingWizard'
import MonthlyClosingHistory from '@/components/reportes/cierre-mensual/MonthlyClosingHistory'

export const metadata: Metadata = {
    title: 'Cierre Mensual | Ethos',
    description: 'Gestión de cierres contables mensuales y auditoría',
}

export default function MonthlyClosingPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 text-gray-900">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Cierre Mensual</h1>
                <p className="mt-2 text-gray-600">
                    Proceso de validación, conciliación y bloqueo de periodos contables.
                    Una vez cerrado un mes, no se podrán modificar sus transacciones.
                </p>
            </div>

            <MonthlyClosingWizard />

            <MonthlyClosingHistory />
        </div>
    )
}
