import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './logout-button'
import { formatPhone } from '@/lib/formatters'
import { ChevronRight, Mail, Phone, Lock, User, UserCircle } from 'lucide-react'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch additional profile data if exists
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const initials = user.email?.substring(0, 2).toUpperCase() || 'US'
    const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=312e81&color=fff&size=200`

    // Mock phone since it might not be in auth metadata
    // Mock phone since it might not be in auth metadata
    const phone = formatPhone(user.user_metadata?.phone) || 'Não informado'
    const role = profile?.role === 'admin' ? 'Administrador' : 'Usuário'

    const rawName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
    const displayName = rawName
        .split(/[._ ]+/)
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="flex flex-col items-center pt-8 pb-4">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-full shadow-lg overflow-hidden border-4 border-white transition-transform duration-300 group-hover:scale-105">
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">{displayName}</h1>
                <p className="text-gray-500 font-medium text-sm mt-1">{role}</p>
            </div>

            {/* Info Groups */}
            <div className="space-y-6">

                {/* Contact Info Group */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Cell: Email */}
                    <div className="flex items-center justify-between p-4 min-h-[50px]">
                        <span className="text-gray-900 font-medium">E-mail</span>
                        <span className="text-gray-500 text-sm md:text-base">{user.email}</span>
                    </div>

                    <div className="h-px bg-gray-100 ml-4" /> {/* Indented Separator */}

                    {/* Cell: Phone */}
                    <div className="flex items-center justify-between p-4 min-h-[50px]">
                        <span className="text-gray-900 font-medium">Telefone</span>
                        <span className="text-gray-500 text-sm md:text-base">{phone}</span>
                    </div>
                </div>

                {/* Account Actions Group */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Link: Change Password */}
                    <Link href="/dashboard/profile/security" className="w-full flex items-center justify-between p-4 min-h-[50px] hover:bg-gray-50 transition-colors group text-left">
                        <span className="text-[#007AFF] font-medium">Alterar Senha</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                    </Link>

                    <div className="h-px bg-gray-100 ml-4" />

                    {/* Link: Edit Profile */}
                    <Link href="/dashboard/profile/edit" className="w-full flex items-center justify-between p-4 min-h-[50px] hover:bg-gray-50 transition-colors group text-left">
                        <span className="text-[#007AFF] font-medium">Editar Perfil</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                    </Link>
                </div>

            </div>

            <LogoutButton />

            <p className="text-center text-xs text-gray-400 mt-8">
                Conta criada em {new Date(user.created_at).toLocaleDateString('pt-BR')}
            </p>
        </div>
    )
}
