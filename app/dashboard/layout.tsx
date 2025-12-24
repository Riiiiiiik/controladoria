import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'

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

    // Fetch user role for sidebar
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const userRole = profile?.role || 'controller'

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex">
            <Sidebar userRole={userRole} />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
