'use server'
 
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/security/audit'
 
// Tipo de tabla soportada
type TransactionTable = 'transactions_income' | 'transactions_expense'
 
export async function softDeleteTransaction(
  table: TransactionTable,
  id: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
 
  // Obtener registro actual para audit log
  const { data: record, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
 
  if (fetchError || !record) return { error: 'Registro no encontrado' }
 
  // Verificar que el período no esté cerrado
  const { data: isClosed } = await supabase
    .rpc('is_period_closed', {
      p_organization_id: record.organization_id,
      p_date: record.date
    })
 
  if (isClosed) {
    return { error: 'No se puede eliminar: el período contable está cerrado' }
  }
 
  // Verificar que no esté finalizado
  if (record.status === 'finalized') {
    return { error: 'No se puede eliminar un registro finalizado. Anúlelo primero.' }
  }
 
  // Soft delete
  const { error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq('id', id)
 
  if (error) return { error: error.message }
 
  // Registrar en audit log
  await createAuditLog({
    organizationId: record.organization_id,
    userId: user.id,
    action: 'DELETE',
    tableName: table,
    recordId: id,
    oldData: record,
  })
 
  revalidatePath('/dashboard/ingresos')
  revalidatePath('/dashboard/gastos')
  return { success: true }
}
 
export async function restoreTransaction(
  table: TransactionTable,
  id: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
 
  const { data: record } = await supabase
    .from(table).select('*').eq('id', id).not('deleted_at', 'is', null).single()
 
  if (!record) return { error: 'Registro no encontrado o no está eliminado' }
 
  const { error } = await supabase
    .from(table)
    .update({ deleted_at: null, deleted_by: null })
    .eq('id', id)
 
  if (error) return { error: error.message }
 
  await createAuditLog({
    organizationId: record.organization_id,
    userId: user.id,
    action: 'RESTORE',
    tableName: table,
    recordId: id,
    newData: record,
  })
 
  revalidatePath('/dashboard/ingresos')
  revalidatePath('/dashboard/gastos')
  return { success: true }
}
