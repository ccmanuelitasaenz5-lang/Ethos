import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import ExpenseTable from '@/components/gastos/ExpenseTable'

export default async function GastosPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user?.id)
        .maybeSingle()

    const organizationId = userData?.organization_id

    // Get organization name (only if organizationId exists)
    let orgName = 'Organización'
    if (organizationId) {
        const { data: orgData } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .maybeSingle()
        if (orgData) orgName = orgData.name
    }

    const { data: expenses } = organizationId
        ? await supabase
            .from('transactions_expense')
            .select('*')
            .eq('organization_id', organizationId)
            .order('date', { ascending: false })
        : { data: [] }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gastos</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Gestión de facturas y egresos
                    </p>
                </div>
                <Link
                    href="/dashboard/gastos/nuevo"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nuevo Gasto
                </Link>
            </div>

            <ExpenseTable expenses={expenses || []} organizationName={orgName} />
        </div>
    )
}
