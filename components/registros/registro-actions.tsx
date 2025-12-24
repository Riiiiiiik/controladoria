```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteRegistro } from '@/actions/delete-registro'
import { Check, X, Edit2, Trash2, Loader2 } from 'lucide-react'

interface RegistroActionsProps {
    registroId: string
    registroStatus: string
}

export default function RegistroActions({ registroId, registroStatus }: RegistroActionsProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false) // For status updates
    const [isDeleting, setIsDeleting] = useState(false) // For delete action
    const [showConfirm, setShowConfirm] = useState(false) // For delete confirmation

    const handleUpdateStatus = async (status: string) => {
        setLoading(true)
        const { error } = await supabase
            .from('registros')
            .update({ status })
            .eq('id', registroId)

        if (!error) {
            router.refresh()
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteRegistro(registroId)

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
            {registroStatus === 'Pendente' && (
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

            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    )
}
