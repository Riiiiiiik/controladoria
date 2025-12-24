import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import { redirect } from 'next/navigation'
import AddUserDialog from '@/components/users/add-user-dialog'
import UserActions from '@/components/users/user-actions'
import { Plus } from 'lucide-react'

export default async function UsersPage() {
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabaseUser
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        redirect('/dashboard')
    }

    const supabase = createAdminClient()

    // Fetch users with pagination
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    })

    // Fetch all profiles to get roles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, role')

    if (error) {
        return (
            <div className="p-4 rounded-md bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400">
                Error loading users: {error.message}
            </div>
        )
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p.role]) || [])

    // Filter: Must have a profile AND not banned
    const activeUsers = users.filter(user => {
        const hasProfile = profileMap.has(user.id)
        const isBanned = (user as any).banned_until && new Date((user as any).banned_until) > new Date()
        return hasProfile && !isBanned
    })

    // Sort provided users by creation date desc
    const sortedUsers = activeUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())


    return (
        <div className="max-w-7xl w-full mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Usuários do Sistema</h1>
                    <p className="text-[13px] text-gray-500 leading-relaxed">Gerencie os usuários e permissões do sistema.</p>
                </div>
                <div>
                    <AddUserDialog />
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 rounded-tl-[20px]">Email</th>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Nível</th>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center">Criado em</th>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center">Último Login</th>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">ID</th>
                            <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 rounded-tr-[20px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {sortedUsers.map((user) => {
                            const initials = user.email?.substring(0, 2).toUpperCase() || '??'
                            // Basic logic for now, Supabase auth doesn't clearly give 'status' without checking bans
                            const isActive = !(user as any).banned_until

                            return (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center font-semibold text-xs ring-1 ring-blue-100">
                                                {initials}
                                            </div>
                                            <span className="text-[13px] font-medium text-gray-700">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200/50">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/50">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                Suspenso
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {profileMap.get(user.id) === 'admin' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                                                Administrador
                                            </span>
                                        ) : profileMap.get(user.id) === 'viewer' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wide">
                                                Visualizador
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
                                                Controlador
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-[13px] font-medium text-gray-600">
                                            {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : '-'}
                                        </div>
                                        <span className="text-gray-400 text-[11px] block mt-0.5">
                                            {user.created_at ? format(new Date(user.created_at), 'HH:mm') : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-[13px] font-medium text-gray-600">
                                            {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'dd/MM/yyyy') : 'Nunca'}
                                        </div>
                                        <span className="text-gray-400 text-[11px] block mt-0.5 font-normal">
                                            {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'HH:mm') : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                            {user.id.split('-')[0]}...
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <UserActions
                                            userId={user.id}
                                            userEmail={user.email || ''}
                                            currentRole={profileMap.get(user.id) || 'controller'}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
