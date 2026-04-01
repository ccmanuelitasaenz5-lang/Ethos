import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import AssetTable from '@/components/inventario/AssetTable'
import { Asset } from '@/types/database'

const ITEMS_PER_PAGE = 10

export default async function InventarioPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const currentPage = Number(searchParams.page) || 1
    const offset = (currentPage - 1) * ITEMS_PER_PAGE
    const status = (searchParams.status as string) || 'all'
    const category = (searchParams.category as string) || 'all'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    const organizationId = userData?.organization_id
    if (!organizationId) return null

    // Get organization name
    const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single()
    const orgName = orgData?.name || 'Organización'

    // Query builder for filtered assets
    let query = supabase
        .from('active_inventory') // Using the new view
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)

    if (status !== 'all') {
        query = query.eq('status', status)
    }
    if (category !== 'all') {
        query = query.eq('category', category)
    }

    const { data: assetsData, count: totalItems } = await query
        .order('purchase_date', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)

    const assets = (assetsData as unknown as Asset[]) || []

    // Get summary calculations from all assets (filtered by org but not paginated)
    const { data: allAssets } = await supabase
        .from('active_inventory')
        .select('cost_usd, accumulated_depreciation')
        .eq('organization_id', organizationId)

    const totalCost = allAssets?.reduce((sum, a) => sum + (a.cost_usd || 0), 0) || 0
    const totalDepreciation = allAssets?.reduce((sum, a) => sum + (a.accumulated_depreciation || 0), 0) || 0
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
                <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Costo Total</h3>
                    <p className="mt-2 text-3xl font-bold text-blue-600">
                        ${totalCost.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{allAssets?.length || 0} activos en total</p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Depreciación Acumulada</h3>
                    <p className="mt-2 text-3xl font-bold text-orange-600">
                        ${totalDepreciation.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {totalCost > 0 ? ((totalDepreciation / totalCost) * 100).toFixed(1) : 0}% del costo total
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Valor Neto en Libros</h3>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                        ${netValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Estimación actual</p>
                </div>
            </div>

            <AssetTable
                assets={assets}
                organizationName={orgName}
                totalItems={totalItems || 0}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                filters={{
                    status,
                    category
                }}
            />
        </div>
    )
}
