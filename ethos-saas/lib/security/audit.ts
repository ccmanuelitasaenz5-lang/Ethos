import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
 
interface AuditLogEntry {
  organizationId: string
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'CLOSE_PERIOD'
  tableName: string
  recordId: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
}
 
export async function createAuditLog(entry: AuditLogEntry) {
  try {
    const supabase = await createClient()
    const headersList = await headers()
 
    await supabase.from('audit_logs').insert({
      organization_id: entry.organizationId,
      user_id:         entry.userId,
      action:          entry.action,
      table_name:      entry.tableName,
      record_id:       entry.recordId,
      old_data:        entry.oldData ?? null,
      new_data:        entry.newData ?? null,
      ip_address:      headersList.get('x-forwarded-for') ?? 'unknown',
      user_agent:      headersList.get('user-agent') ?? 'unknown',
    })
  } catch (e) {
    // Audit log no debe romper el flujo principal
    console.error('[AuditLog] Error registrando entrada:', e)
  }
}
