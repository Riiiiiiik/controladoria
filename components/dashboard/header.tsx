'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

import UserClockIn from './user-clock-in'

export default function Header({ user, userRole = 'user' }: { user: any, userRole?: string }) {
    const supabase = createClient()



    // Get initials for avatar fallback
    const email = user?.email || 'User'
    const initials = email.substring(0, 2).toUpperCase()
    // Use UI Avatars to match the design style
    const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=312e81&color=fff`

    return (
        <header className="h-16 border-b border-gray-200/60 flex items-center justify-end px-8 gap-6 bg-gray-50/80 backdrop-blur-xl sticky top-0 z-10 w-full transition-all duration-300">
            <UserClockIn />

            <div className="h-6 w-px bg-gray-300/50 mx-2 hidden sm:block"></div>

            <Link href="/dashboard/profile">
                <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-full transition-all duration-200 hover:bg-white/50" title={`${user?.email} (${userRole === 'admin' ? 'Administrador' : 'Online'})`}>
                    <div className="w-9 h-9 rounded-full bg-gray-200/50 border border-white/50 flex items-center justify-center text-gray-600 font-bold overflow-hidden shadow-sm ring-2 ring-white/50">
                        <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
            </Link>


        </header>
    )
}
