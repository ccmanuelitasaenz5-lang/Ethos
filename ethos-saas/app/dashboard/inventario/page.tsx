import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import AssetTable from '@/components/inventario/AssetTable'

export default async function InventarioPage() {
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

    const { data: assets } = organizationId
        ? await supabase
            .from('assets')
            .select('*')
            .eq('organization_id', organizationId)
            .order('purchase_date', { ascending: false })
        : { data: [] }

    // Calculate totals
    const totalCost = assets?.reduce((sum, a) => sum + (a.cost_usd || 0), 0) || 0
    const totalDepreciation = assets?.reduce((sum, a) => sum + (a.accumulated_depreciation || 0), 0) || 0
    const netValue = totalCost - totalDepreciation

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventario de Activos</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Gestión de activos fijos y depreciación
                    </p>
                </div>
                <Link
                    href="/dashboard/inventario/nuevo"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nuevo Activo
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-500">Costo Total</h3>
                    <p className="mt-2 text-3xl font-bold text-blue-600">
                        ${totalCost.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{assets?.length || 0} activos</p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-500">Depreciación Acumulada</h3>
                    <p className="mt-2 text-3xl font-bold text-orange-600">
                        ${totalDepreciation.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {totalCost > 0 ? ((totalDepreciation / totalCost) * 100).toFixed(1) : 0}% del costo
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-500">Valor Neto</h3>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                        ${netValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Valor en libros</p>
                </div>
            </div>

            <AssetTable assets={assets || []} organizationName={orgName} />
        </div>
    )
}
