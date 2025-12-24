'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { AppleInput } from '@/components/ui/apple-input'
import { AppleButton } from '@/components/ui/apple-button'
import { AppleCard } from '@/components/ui/apple-card'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetSuccess, setResetSuccess] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setResetLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) {
            setError(error.message)
            setResetLoading(false)
        } else {
            setResetSuccess(true)
            setResetLoading(false)
            setTimeout(() => {
                setShowForgotPassword(false)
                setResetSuccess(false)
                setResetEmail('')
            }, 3000)
        }
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-700">

            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-60 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/60 blur-[120px] rounded-full mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/60 blur-[120px] rounded-full mix-blend-multiply"></div>
            </div>

            <div className="w-full max-w-[360px] z-10 flex flex-col items-center">

                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-[60px] h-[60px] bg-[#0071e3] rounded-[18px] flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 transition-transform hover:scale-105 duration-500">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.355r1.424-4.885A2.333 2.333 0 0012 14c-1.288 0-2.333 1.045-2.333 2.333l1.424 4.885z"></path>
                        </svg>
                    </div>
                    <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 mb-2">Login</h1>
                    <p className="text-[15px] text-gray-500 font-normal leading-relaxed">Entre com suas credenciais para acessar.</p>
                </div>

                <div className="w-full bg-white/80 backdrop-blur-md rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-1 pb-1">
                    <div className="p-8 pb-6">
                        <form className="space-y-5" onSubmit={handleLogin}>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider pl-1">E-mail</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="nome@empresa.com"
                                        required
                                        className="w-full h-12 px-4 rounded-xl bg-gray-100/50 text-gray-900 text-[15px] placeholder-gray-400 border-0 ring-0 focus:ring-2 focus:ring-[#0071e3] transition-all duration-200 ease-out outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center pl-1">
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Senha</label>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full h-12 px-4 rounded-xl bg-gray-100/50 text-gray-900 text-[15px] placeholder-gray-400 border-0 ring-0 focus:ring-2 focus:ring-[#0071e3] transition-all duration-200 ease-out outline-none"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 text-red-600 border border-red-100 p-3 text-sm flex items-center gap-2 animate-pulse">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[48px] mt-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] font-semibold rounded-[18px] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] flex items-center justify-center active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
                            </button>
                        </form>
                    </div>

                    <div className="px-8 py-5 border-t border-gray-100/60 text-center">
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-[13px] font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors"
                        >
                            Esqueceu a senha?
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-[11px] font-medium text-gray-400 uppercase tracking-widest text-center">
                    &copy; 2025 Controladoria System
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-md w-full">
                        <div className="p-6 text-center border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Recuperar Senha</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Digite seu e-mail para receber as instruções
                            </p>
                        </div>

                        {resetSuccess ? (
                            <div className="p-6">
                                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-green-900 text-sm">E-mail enviado!</p>
                                        <p className="text-green-700 text-xs mt-0.5">Verifique sua caixa de entrada</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="p-6">
                                <div className="space-y-2 mb-4">
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider pl-1">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        placeholder="nome@empresa.com"
                                        required
                                        autoFocus
                                        className="w-full h-12 px-4 rounded-xl bg-gray-100/50 text-gray-900 text-[15px] placeholder-gray-400 border-0 ring-0 focus:ring-2 focus:ring-[#0071e3] transition-all duration-200 ease-out outline-none"
                                    />
                                </div>

                                {error && (
                                    <div className="mb-4 rounded-xl bg-red-50 text-red-600 border border-red-100 p-3 text-xs flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForgotPassword(false)
                                            setResetEmail('')
                                            setError(null)
                                        }}
                                        className="flex-1 h-[44px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={resetLoading}
                                        className="flex-1 h-[44px] rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm transition-all disabled:opacity-70 flex items-center justify-center"
                                    >
                                        {resetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

