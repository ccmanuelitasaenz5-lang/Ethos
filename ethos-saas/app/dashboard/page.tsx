import { createClient } from '@/lib/supabase/server'
import { getDashboardStats } from '@/lib/services/dashboard'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import FinancialCharts from '@/components/dashboard/FinancialCharts'
import { format, startOfMonth, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get user's organization
    const { data: { user } } = await supabase.auth.getUser()

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, full_name, role')
        .eq('id', user?.id)
        .maybeSingle()

    const organizationId = userData?.organization_id

    // Get financial stats via cached service
    const { incomeData, expenseData, bankAccounts } = organizationId 
        ? await getDashboardStats(organizationId)
        : { incomeData: [], expenseData: [], bankAccounts: [] }


    // Calculate totals for cards (USD and VES)
    const totalIncomeUSD = incomeData.reduce((sum, t) => sum + (t.amount_usd || 0), 0)
    const totalIncomeVES = incomeData.reduce((sum, t) => sum + (t.amount_ves || 0), 0)

    const totalExpenseUSD = expenseData.reduce((sum, t) => sum + (t.amount_usd || 0), 0)
    const totalExpenseVES = expenseData.reduce((sum, t) => sum + (t.amount_ves || 0), 0)

    const balanceUSD = totalIncomeUSD - totalExpenseUSD
    const balanceVES = totalIncomeVES - totalExpenseVES

    // Calculate Bank Balance
    const bankBalanceUSD = bankAccounts.reduce((sum, acc) => sum + (acc.currency === 'USD' ? (acc.current_balance || 0) : 0), 0)
    const bankBalanceVES = bankAccounts.reduce((sum, acc) => sum + (acc.currency === 'VES' ? (acc.current_balance || 0) : 0), 0)

    const stats = {
        totalIncome: totalIncomeUSD,
        totalIncomeVES: totalIncomeVES,
        totalExpenses: totalExpenseUSD,
        totalExpensesVES: totalExpenseVES,
        balance: balanceUSD,
        balanceVES: balanceVES,
        transactionCount: incomeData.length + expenseData.length,
        bankBalance: bankBalanceUSD,
        bankBalanceVES: bankBalanceVES
    }


    // Prepare Trend Data (Last 6 months)
    const trendMap: Record<string, { month: string, ingresos: number, gastos: number }> = {}

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const key = format(d, 'MMM', { locale: es })
        trendMap[key] = { month: key, ingresos: 0, gastos: 0 }
    }

    incomeData.forEach(t => {
        const key = format(parseISO(t.date), 'MMM', { locale: es })
        if (trendMap[key]) trendMap[key].ingresos += t.amount_usd || 0
    })

    expenseData.forEach(t => {
        const key = format(parseISO(t.date), 'MMM', { locale: es })
        if (trendMap[key]) trendMap[key].gastos += t.amount_usd || 0
    })

    const trendData = Object.values(trendMap)

    // Prepare Category Data
    const categoryMap: Record<string, number> = {}
    expenseData.forEach(t => {
        const cat = t.category || 'Otros'
        categoryMap[cat] = (categoryMap[cat] || 0) + (t.amount_usd || 0)
    })

    const categoryData = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Bienvenido de nuevo, <span className="font-semibold">{userData?.full_name || user?.email?.split('@')[0]}</span>
                    </p>
                </div>
            </div>

            <StatsCards stats={stats} />

            <FinancialCharts trendData={trendData} categoryData={categoryData} />

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Transacciones Recientes</h3>
                {organizationId ? (
                    <RecentTransactions organizationId={organizationId} />
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No hay organización vinculada para mostrar transacciones.
                    </div>
                )}
            </div>
        </div>
    )
}
