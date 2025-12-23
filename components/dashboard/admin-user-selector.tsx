import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { User as UserIcon, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface AdminUserSelectorProps {
    users: User[]
}

export default function AdminUserSelector({ users }: AdminUserSelectorProps) {
    return (
        <div className="space-y-10">
            <div className="mb-10">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">Painel Administrativo</h1>
                <p className="text-gray-500 text-[15px]">Selecione um controlador para visualizar e gerenciar seus registros.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <Link
                        key={user.id}
                        href={`/dashboard?userId=${user.id}`}
                        className="bg-white p-6 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-[1.02] duration-300 block group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-[#0071e3] group-hover:bg-[#0071e3] group-hover:text-white transition-colors duration-300">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-bold tracking-wide uppercase">
                                Ativo
                            </span>
                        </div>

                        <div className="space-y-1 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 truncate tracking-tight group-hover:text-[#0071e3] transition-colors" title={user.email}>
                                {user.email}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono">
                                ID: {user.id.split('-')[0]}...
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-400 font-medium">
                            <div className="flex items-center gap-1.5" title="Criado em">
                                <Calendar className="w-4 h-4 text-gray-300" />
                                <span>{user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : '-'}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Último login">
                                <Clock className="w-4 h-4 text-gray-300" />
                                <span>{user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'HH:mm') : '-'}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
