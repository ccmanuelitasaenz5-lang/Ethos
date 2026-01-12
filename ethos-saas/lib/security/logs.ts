import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export type SecurityEventType = 'login_attempt' | 'signup_attempt' | 'critical_action' | 'password_reset'

/**
 * Logs a security event to the database.
 * Use this to track failed logins, sensitive actions, etc.
 */
export async function logSecurityEvent(
    eventType: SecurityEventType,
    status: 'success' | 'failure',
    details: {
        email?: string
        userId?: string
        metadata?: Record<string, any>
    }
) {
    try {
        const supabase = createClient()

        // Get IP address from headers
        const headersList = headers()
        // x-forwarded-for can be comma separated, take the first one
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'

        const { error } = await supabase.from('security_logs').insert({
            event_type: eventType,
            status,
            ip_address: ip,
            user_email: details.email,
            user_id: details.userId,
            metadata: details.metadata || {}
        })

        if (error) {
            console.error('Error writing security log:', error)
        }
    } catch (error) {
        // Fail silently to not block main flow, but log to console
        console.error('Failed to log security event:', error)
    }
}

/**
 * Checks if the current IP has exceeded the rate limit for a specific action.
 * Returns true if the request should be BLOCKED.
 *
 * @param eventType The type of event to check (e.g. 'login_attempt')
 * @param maxAttempts Max number of FAILURE attempts allowed
 * @param windowMinutes Time window in minutes
 */
export async function isRateLimited(
    eventType: SecurityEventType,
    maxAttempts: number = 5,
    windowMinutes: number = 15
): Promise<boolean> {
    try {
        const supabase = createClient()
        const headersList = headers()
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'

        // Call the database function defined in migration 006
        const { data, error } = await supabase.rpc('check_rate_limit', {
            p_ip_address: ip,
            p_event_type: eventType,
            p_window_minutes: windowMinutes,
            p_max_attempts: maxAttempts
        })

        if (error) {
            console.error('Rate limit DB check failed:', error)
            return false // Fail open (allow request) if DB check fails to prevent accidental lockouts
        }

        return !!data
    } catch (error) {
        console.error('Rate limit check error:', error)
        return false
    }
}
