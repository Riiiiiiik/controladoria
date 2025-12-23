import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditProfileForm from './edit-profile-form'
import { ChevronLeft } from 'lucide-react'

export default async function EditProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const rawName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
    const displayName = rawName.split(/[._ ]+/).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
    const phone = user.user_metadata?.phone || ''

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Back Button */}
            <div className="flex items-center gap-2 mb-6">
                <Link href="/dashboard/profile" className="p-2 -ml-2 text-[#007AFF] hover:bg-blue-50/50 rounded-full transition-colors flex items-center gap-1">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium">Voltar</span>
                </Link>
                <h1 className="text-xl font-bold text-gray-900 ml-auto mr-auto pr-16">Editar Perfil</h1>
            </div>

            <EditProfileForm displayName={displayName} phone={phone} />
        </div>
    )
}
