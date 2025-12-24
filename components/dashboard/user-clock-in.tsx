'use client'

import { Clock } from 'lucide-react'
import { useState } from 'react'

export default function UserClockIn() {
    // Determine the current greeting based on the time of day
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Bom dia'
        if (hour < 18) return 'Boa tarde'
        return 'Boa noite'
    }

    const [loading, setLoading] = useState(false)
    const [showToast, setShowToast] = useState(false)

    const handleClockIn = () => {
        // Immediate visual feedback
        setLoading(true)
        setShowToast(true)

        // Open popup immediately (don't wait for anything)
        const width = 1200
        const height = 800
        const left = (window.screen.width - width) / 2
        const top = (window.screen.height - height) / 2

        const popup = window.open(
            'https://app.tangerino.com.br/Tangerino/pages/baterPonto/',
            'TangerinoPonto',
            `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
        )

        // Focus the popup if it was successfully opened
        if (popup) popup.focus()

        // Reset states after showing feedback
        setTimeout(() => {
            setLoading(false)
            setTimeout(() => setShowToast(false), 2000)
        }, 600)
    }

    return (
        <>
            <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                    <p className="text-[13px] font-medium text-gray-500">
                        {getGreeting()}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium lowercase first-letter:uppercase">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                <button
                    onClick={handleClockIn}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#0071e3] to-[#2B8CED] hover:from-[#0077ED] hover:to-[#3CA1FF] text-white px-5 py-2.5 rounded-full transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group border border-blue-400/20"
                >
                    <Clock className={`w-4 h-4 text-white/90 ${loading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="font-semibold text-sm tracking-wide">
                        {loading ? 'Abrindo...' : 'Registrar Ponto'}
                    </span>
                </button>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-200/80 rounded-2xl px-5 py-3.5 flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300 z-50">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-sm font-medium text-gray-700">Janela de ponto aberta!</p>
                </div>
            )}
        </>
    )
}
