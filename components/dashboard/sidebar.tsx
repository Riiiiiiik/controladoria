import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, ChevronLeft, ChevronRight, Shield, Bell } from 'lucide-react'

interface SidebarProps {
    role?: string
    isCollapsed: boolean
    toggleCollapse: () => void
}

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        activeClass: 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20',
        inactiveClass: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    },
    {
        label: 'Importar Histórico',
        icon: FileText,
        href: '/dashboard/history-import',
        activeClass: 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20',
        inactiveClass: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    },
    {
        label: 'Usuários',
        icon: Users,
        href: '/dashboard/users',
        activeClass: 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20',
        inactiveClass: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    },
]

export default function Sidebar({ role, isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside className={`bg-[#F9FAFB] border-r border-gray-100 flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`p-6 flex items-center gap-3 ${isCollapsed ? 'justify-center p-4' : ''}`}>
                <div className="w-8 h-8 bg-[#0071e3] rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                {!isCollapsed && (
                    <span className="text-lg font-semibold tracking-tight text-gray-900 whitespace-nowrap">
                        Controladoria
                    </span>
                )}
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {routes.filter(route => route.label !== 'Usuários' || role === 'admin').map((route) => {
                    const isActive = pathname === route.href

                    let label = route.label
                    let Icon = route.icon

                    if (role === 'controller' && route.label === 'Dashboard') {
                        label = 'Notificações'
                        Icon = Bell
                    }

                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={`flex items-center gap-3 px-3 py-2.5 mx-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-[#0071e3] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                                : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'
                                } ${isCollapsed ? 'justify-center mx-2 px-0' : ''}`}
                            title={isCollapsed ? label : undefined}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 stroke-[1.5px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            {!isCollapsed && <span className="font-medium text-[14px] whitespace-nowrap">{label}</span>}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4">
                <button
                    onClick={toggleCollapse}
                    className={`flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors w-full rounded-lg p-2 hover:bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span>Recolher Menu</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    )
}
