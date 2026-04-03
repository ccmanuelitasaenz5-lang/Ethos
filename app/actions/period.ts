'use server'
 
import { createClient } from '@/lib/supabase/server'
import { createAuditLog } from '@/lib/security/audit'
import { revalidatePath } from 'next/cache'
 
export async function closePeriod(year: number, month: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
 
  const { data: userData } = await supabase
    .from('users').select('organization_id, role').eq('id', user.id).single()
 
  if (!userData || userData.role !== 'admin')
    return { error: 'Solo los administradores pueden cerrar períodos' }
 
  const orgId = userData.organization_id
 
  // Verificar que no haya borradores en ese período
  const startDate = `${year}-${String(month).padStart(2,'0')}-01`
  const endDate   = new Date(year, month, 0).toISOString().split('T')[0]
 
  const { count: draftCount } = await supabase
    .from('transactions_income')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'draft')
    .is('deleted_at', null)
    .gte('date', startDate)
    .lte('date', endDate)
 
  if ((draftCount ?? 0) > 0)
    return { error: `Hay ${draftCount} ingresos en borrador en este período. Finalícelos antes de cerrar.` }
 
  // Upsert del período como cerrado
  const { data: period, error } = await supabase
    .from('accounting_periods')
    .upsert({
      organization_id: orgId,
      year, month,
      status: 'closed',
      closed_at: new Date().toISOString(),
      closed_by: user.id,
    }, { onConflict: 'organization_id,year,month' })
    .select('id').single()
 
  if (error) return { error: error.message }
 
  await createAuditLog({
    organizationId: orgId,
    userId: user.id,
    action: 'CLOSE_PERIOD',
    tableName: 'accounting_periods',
    recordId: period!.id,
    newData: { year, month, status: 'closed' },
  })
 
  revalidatePath('/dashboard/reportes')
  revalidatePath('/dashboard/configuracion')
  return { success: true }
}
