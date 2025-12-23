'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center p-4 min-h-[50px] hover:bg-gray-50 transition-colors group text-center"
            >
                <span className="text-red-500 font-medium text-lg">Sair</span>
            </button>
        </div>
    )
}
