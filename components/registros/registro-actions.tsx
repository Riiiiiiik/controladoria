'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { deleteRegistro } from '@/actions/delete-registro'
import { Check, X, Edit2, Trash2, Loader2 } from 'lucide-react'

interface RegistroActionsProps {
    registro: any
}

export default function RegistroActions({ registro }: RegistroActionsProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleUpdateStatus = async (status: string) => {
        setLoading(true)
        const { error } = await supabase
            .from('registros')
            .update({ status })
            .eq('id', registro.id)

        if (!error) {
            router.refresh()
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteRegistro(registro.id)

        if (result.error) {
            alert(result.error)
            setIsDeleting(false)
            setShowConfirm(false)
        } else {
            router.refresh()
        }
    }

    return (
        <div className="flex items-center justify-center gap-1 opacity-100 transition-opacity">
            {registro.status === 'Pendente' && (
                <>
                    <button
                        onClick={() => handleUpdateStatus('Aprovado')}
                        disabled={loading}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors"
                        title="Aprovar"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => handleUpdateStatus('Reprovado')}
                        disabled={loading}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Rejeitar"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-1"></div>
                </>
            )}

            <button
                onClick={() => router.push(`/dashboard/registros/${registro.id}/edit`)}
                className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition-colors"
                title="Editar"
            >
                <Edit2 className="h-4 w-4" />
            </button>

            {showConfirm ? (
                <>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors"
                        title="Confirmar exclusão"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        disabled={isDeleting}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Cancelar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </>
            ) : (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Excluir"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}
