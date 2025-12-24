import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import RegistrosTable from '@/components/registros/registros-table'
import AdminUserSelector from '@/components/dashboard/admin-user-selector'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'

interface DashboardPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const supabase = await createClient()
    const params = await searchParams

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user role
    let userRole = 'controller'
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        if (profile) {
            userRole = profile.role
        }
    }

    const selectedYear = (params.year as string) || new Date().getFullYear().toString()
    const targetUserId = params.userId as string

    // --- ADMIN USER SELECTION ---
    if (userRole === 'admin' && !targetUserId) {
        const adminSupabase = createAdminClient()
        const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers({
            page: 1,
            perPage: 100
        })

        if (usersError) {
            return <div className="p-4 text-red-500">Erro ao carregar usuários: {usersError.message}</div>
        }

        const sortedUsers = users.sort((a, b) => (a.email || '').localeCompare(b.email || ''))
        return <AdminUserSelector users={sortedUsers} />
    }

    // --- DATA FETCHING (Common for Admin viewing user and Controller) ---
    const currentUserId = userRole === 'admin' ? targetUserId : user?.id

    if (!currentUserId) {
        return <div className="p-4 text-red-500">Usuário não identificado.</div>
    }

    // 1. Fetch range of years for the user efficiently
    const { data: latestRecord } = await supabase
        .from('registros')
        .select('data_contato')
        .eq('user_id', currentUserId)
        .order('data_contato', { ascending: false })
        .limit(1)
        .single()

    const { data: oldestRecord } = await supabase
        .from('registros')
        .select('data_contato')
        .eq('user_id', currentUserId)
        .order('data_contato', { ascending: true })
        .limit(1)
        .single()

    const availableYears: string[] = []
    if (latestRecord?.data_contato && oldestRecord?.data_contato) {
        const latestYear = parseInt(latestRecord.data_contato.split('-')[0])
        const oldestYear = parseInt(oldestRecord.data_contato.split('-')[0])
        for (let y = latestYear; y >= oldestYear; y--) {
            availableYears.push(y.toString())
        }
    } else {
        // Fallback to current year if no records
        availableYears.push(new Date().getFullYear().toString())
    }


    // If selectedYear is not in availableYears and there are years, default to the latest
    const yearToFetch = availableYears.includes(selectedYear) ? selectedYear : (availableYears[0] || selectedYear)

    // 2. Fetch records for the selected year
    const startDate = `${yearToFetch}-01-01`
    const endDate = `${yearToFetch}-12-31`

    // Fetch records with pagination to bypass 1000 row limit
    let allRegistros: any[] = []
    let fetchPage = 0
    const fetchPageSize = 1000
    let keepFetching = true

    while (keepFetching) {
        const { data, error } = await supabase
            .from('registros')
            .select('*')
            .eq('user_id', currentUserId)
            .gte('data_contato', startDate)
            .lte('data_contato', endDate)
            .order('data_contato', { ascending: false })
            .range(fetchPage * fetchPageSize, (fetchPage + 1) * fetchPageSize - 1)

        if (error) {
            return <div className="p-4 text-red-500">Erro ao carregar registros: {error.message}</div>
        }

        if (data && data.length > 0) {
            allRegistros = [...allRegistros, ...data]
            if (data.length < fetchPageSize) {
                keepFetching = false
            } else {
                fetchPage++
            }
        } else {
            keepFetching = false
        }
    }

    const registros = allRegistros
    const registrosError = null



    // Get user name for Admin view
    let userName = 'Usuário'
    if (userRole === 'admin' && targetUserId) {
        const adminSupabase = createAdminClient()
        const { data: { user: targetUser } } = await adminSupabase.auth.admin.getUserById(targetUserId)
        if (targetUser && targetUser.email) {
            const emailName = targetUser.email.split('@')[0]
            const firstName = emailName.split('.')[0]
            userName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
        }
    }

    return (
        <div className="space-y-8">
            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    {userRole === 'admin' && targetUserId ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="flex items-center text-sm text-gray-400 hover:text-gray-900 transition-colors mb-2"
                            >
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Voltar para seleção
                            </Link>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                Notificações de {userName}
                            </h1>
                            <p className="text-xs text-gray-400 font-mono mt-1 bg-gray-100/50 inline-block px-2 py-1 rounded">ID: {targetUserId}</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Controle de Notificações</h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Gerenciamento de notificações e registros.
                            </p>
                        </>
                    )}
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href="/dashboard/new"
                        className="block rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-600/30 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Nova Notificação
                        </span>
                    </Link>
                </div>
            </div>
            <RegistrosTable
                registros={registros || []}
                userRole={userRole}
                availableYears={availableYears}
                selectedYear={yearToFetch}
            />
        </div>
    )
}

