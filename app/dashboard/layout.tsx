import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/dashboard/dashboard-layout-client'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    let { data: { user } } = await supabase.auth.getUser()

    let userRole = 'admin' // Default to admin for demo

    if (!user) {
        // Mock user for bypass
        user = {
            id: 'mock-id',
            email: 'demo_audax@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
        } as any
    } else {
        // Fetch profile to get role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        if (profile?.role) userRole = profile.role
    }

    return (
        <DashboardLayoutClient user={user} userRole={userRole}>
            {children}
        </DashboardLayoutClient>
    )
}
