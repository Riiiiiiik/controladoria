import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/dashboard/dashboard-layout-client'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // SECURITY: Global authentication check for all dashboard routes
    if (!user) {
        redirect('/login')
    }

    // Fetch user role for layout
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const userRole = profile?.role || 'controller'

    return (
        <DashboardLayoutClient user={user} userRole={userRole}>
            {children}
        </DashboardLayoutClient>
    )
}
