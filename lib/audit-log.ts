import { createAdminClient } from './supabase/admin'

interface AuditLogEntry {
    userId: string
    action: string
    details: Record<string, any>
    ipAddress?: string
}

export async function logAdminAction({ userId, action, details, ipAddress }: AuditLogEntry) {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase.from('audit_logs').insert({
            user_id: userId,
            action,
            details,
            ip_address: ipAddress,
            timestamp: new Date().toISOString()
        })

        if (error) {
            console.error('[AUDIT_LOG] Failed to log action:', error)
        }
    } catch (err) {
        console.error('[AUDIT_LOG] Exception:', err)
    }
}

// Audit log types for type safety
export const AuditActions = {
    DELETE_ALL_REGISTROS: 'DELETE_ALL_REGISTROS',
    BULK_IMPORT: 'BULK_IMPORT',
    CREATE_USER: 'CREATE_USER',
    DELETE_USER: 'DELETE_USER',
    UPDATE_USER_ROLE: 'UPDATE_USER_ROLE',
    RESET_PASSWORD: 'RESET_PASSWORD',
} as const

export type AuditAction = typeof AuditActions[keyof typeof AuditActions]
