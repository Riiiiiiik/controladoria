'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/actions/profile'
import { Loader2 } from 'lucide-react'

export default function ChangePasswordForm() {
    const [state, action, isPending] = useActionState(updatePassword, null)

    return (
        <form action={action} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* New Password Input */}
                <div className="flex flex-col sm:flex-row sm:items-center p-4 min-h-[50px] gap-2 sm:gap-4">
                    <label htmlFor="password" className="text-gray-900 font-medium w-32 flex-shrink-0">Nova Senha</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-600 placeholder:text-gray-300 outline-none"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                    />
                </div>

                <div className="h-px bg-gray-100 ml-4" />

                {/* Confirm Password Input */}
                <div className="flex flex-col sm:flex-row sm:items-center p-4 min-h-[50px] gap-2 sm:gap-4">
                    <label htmlFor="confirmPassword" className="text-gray-900 font-medium w-32 flex-shrink-0">Confirmar</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-600 placeholder:text-gray-300 outline-none"
                        placeholder="Digite novamente"
                        required
                        minLength={6}
                    />
                </div>
            </div>

            {state?.error && (
                <div className="px-4 text-sm text-red-500 text-center animate-in fade-in">
                    {state.error}
                </div>
            )}

            <div className="px-4 text-xs text-gray-400 text-center">
                Use uma senha forte com letras, números e símbolos.
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#007AFF] text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm hover:bg-[#0062cc] active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
        </form>
    )
}
