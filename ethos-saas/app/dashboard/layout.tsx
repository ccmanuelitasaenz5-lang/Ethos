import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { getBCVRate } from '@/lib/exchange'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user's organization info
    let { data: userData } = await supabase
        .from('users')
        .select('organization_id, full_name')
        .eq('id', user.id)
        .maybeSingle()

    // --- AUTO-LINK LOGIC ---
    // If the user profile doesn't exist or doesn't have an org, 
    // try to fix it automatically by linking to the first organization.
    if (!userData || !userData.organization_id) {
        const { data: firstOrg } = await supabase
            .from('organizations')
            .select('id')
            .limit(1)
            .maybeSingle()

        if (firstOrg) {
            const { data: newUser } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    organization_id: firstOrg.id,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
                    role: 'resident' // Changed from 'admin' for security (technical audit finding 3.2)
                })
                .select('organization_id, full_name')
                .single()

            if (newUser) {
                userData = newUser
            }
        }
    }

    let organization = null
    if (userData?.organization_id) {
        const { data } = await supabase
            .from('organizations')
            .select('name, rif')
            .eq('id', userData.organization_id)
            .maybeSingle()
        organization = data
    }

    const bcvRate = await getBCVRate()

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    user={user}
                    fullName={userData?.full_name}
                    organizationName={organization?.name}
                    rif={organization?.rif}
                    bcvRate={bcvRate}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
