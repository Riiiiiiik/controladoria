'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import UserForm from './user-form'
import { useRouter } from 'next/navigation'

export default function AddUserDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const handleSuccess = () => {
        setIsOpen(false)
        router.refresh()
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
                <Plus className="w-5 h-5" />
                Adicionar Usuário
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-[24px] shadow-2xl shadow-black/10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                <div className="px-8 pt-6 pb-2 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Novo Usuário</h2>
                        <p className="text-[13px] text-gray-500 mt-1 font-medium">Crie uma nova conta de acesso ao sistema.</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 pt-6">
                    <UserForm onSuccess={handleSuccess} onCancel={() => setIsOpen(false)} />
                </div>
            </div>
        </div>
    )
}
