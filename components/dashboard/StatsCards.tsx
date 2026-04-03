import { DashboardStats } from '@/types/database'
import {
    CurrencyDollarIcon,
    BanknotesIcon,
    ScaleIcon,
    DocumentTextIcon,
    BuildingLibraryIcon
} from '@heroicons/react/24/outline'


interface StatsCardsProps {
    stats: DashboardStats
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            name: 'Ingresos Totales',
            valueUSD: stats.totalIncome,
            valueVES: (stats as any).totalIncomeVES,
            icon: CurrencyDollarIcon,
            color: 'bg-green-600',
        },
        {
            name: 'Gastos Totales',
            valueUSD: stats.totalExpenses,
            valueVES: (stats as any).totalExpensesVES,
            icon: BanknotesIcon,
            color: 'bg-red-600',
        },
        {
            name: 'Balance',
            valueUSD: stats.balance,
            valueVES: (stats as any).balanceVES,
            icon: ScaleIcon,
            color: stats.balance >= 0 ? 'bg-blue-600' : 'bg-orange-600',
        },
        {
            name: 'Saldo en Bancos',
            valueUSD: stats.bankBalance,
            valueVES: stats.bankBalanceVES,
            icon: BuildingLibraryIcon,
            color: 'bg-indigo-600',
        },
        {
            name: 'Transacciones',
            valueUSD: stats.transactionCount,
            icon: DocumentTextIcon,
            color: 'bg-purple-600',
        },
    ]


    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">

            {cards.map((card) => (
                <div
                    key={card.name}
                    className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow"
                >
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className={`flex-shrink-0 rounded-lg p-3 ${card.color}`}>
                                <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        {card.name}
                                    </dt>
                                    <dd className="mt-1">
                                        <div className="text-xl font-bold text-gray-900 leading-none">
                                            {card.name === 'Transacciones'
                                                ? stats.transactionCount
                                                : `$${card.valueUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            }
                                        </div>
                                        {card.valueVES !== undefined && (
                                            <div className="text-xs font-bold text-gray-500 mt-1">
                                                Bs. {card.valueVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
