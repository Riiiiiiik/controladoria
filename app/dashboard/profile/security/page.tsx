import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChangePasswordForm from './change-password-form'
import { ChevronLeft } from 'lucide-react'

export default async function ChangePasswordPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Back Button */}
            <div className="flex items-center gap-2 mb-6">
                <Link href="/dashboard/profile" className="p-2 -ml-2 text-[#007AFF] hover:bg-blue-50/50 rounded-full transition-colors flex items-center gap-1">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium">Voltar</span>
                </Link>
                <h1 className="text-xl font-bold text-gray-900 ml-auto mr-auto pr-16">Alterar Senha</h1>
            </div>

            <ChangePasswordForm />
        </div>
    )
}
