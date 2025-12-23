'use client'

import { useActionState, useState } from 'react'
import { updateProfile } from '@/actions/profile'
import { formatPhone } from '@/lib/formatters'
import { Loader2 } from 'lucide-react'

interface EditProfileFormProps {
    displayName: string
    phone: string
}

export default function EditProfileForm({ displayName, phone }: EditProfileFormProps) {
    const [state, action, isPending] = useActionState(updateProfile, null)
    const [phoneValue, setPhoneValue] = useState(formatPhone(phone))

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value)
        setPhoneValue(formatted)
    }

    return (
        <form action={action} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Name Input */}
                <div className="flex flex-col sm:flex-row sm:items-center p-4 min-h-[50px] gap-2 sm:gap-4">
                    <label htmlFor="fullName" className="text-gray-900 font-medium w-24 flex-shrink-0">Nome</label>
                    <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        defaultValue={displayName}
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-600 placeholder:text-gray-300 outline-none"
                        placeholder="Seu nome completo"
                    />
                </div>

                <div className="h-px bg-gray-100 ml-4" />

                {/* Phone Input */}
                <div className="flex flex-col sm:flex-row sm:items-center p-4 min-h-[50px] gap-2 sm:gap-4">
                    <label htmlFor="phone" className="text-gray-900 font-medium w-24 flex-shrink-0">Telefone</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={phoneValue}
                        onChange={handlePhoneChange}
                        className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-600 placeholder:text-gray-300 outline-none"
                        placeholder="(00) 00000-0000"
                    />
                </div>
            </div>

            {state?.error && (
                <div className="px-4 text-sm text-red-500 text-center animate-in fade-in">
                    {state.error}
                </div>
            )}

            <div className="px-4 text-xs text-gray-400 text-center">
                Essas informações serão visíveis para os administradores.
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#007AFF] text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm hover:bg-[#0062cc] active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </form>
    )
}
