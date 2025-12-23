'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/actions/users'
import { Loader2, Mail, Lock } from 'lucide-react'

interface UserFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export default function UserForm({ onSuccess, onCancel }: UserFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setMessage(null)

        const email = formData.get('email') as string
        if (!email.toLowerCase().includes('@audaxcapitalsa')) {
            setLoading(false)
            setMessage('Apenas e-mails do domínio @audaxcapitalsa são permitidos.')
            return
        }

        const result = await createUser(formData)

        setLoading(false)
        if (result?.error) {
            setMessage(result.error)
        } else {
            if (onSuccess) {
                onSuccess()
            } else {
                router.push('/dashboard/users')
            }
        }
    }

    return (
        <form action={handleSubmit} className="space-y-5" autoComplete="off">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-[13px] font-medium text-gray-700 ml-1">
                        Endereço de E-mail
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0071e3] transition-colors">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="seu.nome@audaxcapitalsa.com.br"
                            required
                            autoComplete="off"
                            className="w-full bg-[#F3F4F6] border-transparent rounded-xl py-3 pl-11 pr-4 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-[13px] font-medium text-gray-700 ml-1">
                        Senha de Acesso
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0071e3] transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            className="w-full bg-[#F3F4F6] border-transparent rounded-xl py-3 pl-11 pr-4 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="role" className="block text-[13px] font-medium text-gray-700 ml-1">
                        Nível de Acesso
                    </label>
                    <div className="relative">
                        <select
                            id="role"
                            name="role"
                            className="w-full bg-[#F3F4F6] border-transparent rounded-xl py-3 px-4 text-[15px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="controller">Controlador</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            {message && <p className="text-red-500 text-[13px] font-medium bg-red-50 p-3 rounded-xl border border-red-100">{message}</p>}

            <div className="flex gap-3 pt-6">
                <button
                    type="button"
                    onClick={() => onCancel ? onCancel() : router.back()}
                    className="flex-1 px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-100/80 transition-all hover:text-gray-900"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 rounded-xl bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Criar Usuário'}
                </button>
            </div>
        </form>
    )
}
