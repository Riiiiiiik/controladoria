'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EditableObservationProps {
    registroId: number
    initialValue: string | null
    parsedValue: string
}

export default function EditableObservation({ registroId, initialValue, parsedValue }: EditableObservationProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(parsedValue)
    const [loading, setLoading] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus()
            // Adjust height
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [isEditing])

    const handleSave = async () => {
        if (value === parsedValue) {
            setIsEditing(false)
            return
        }

        setLoading(true)

        // Prepare new JSON object
        // We try to preserve existing structure if possible, but for now we'll just upsert standard keys
        let newContent: any = {}
        try {
            if (initialValue) {
                newContent = JSON.parse(initialValue)
            }
        } catch (e) {
            // If it wasn't JSON, we keep the old raw text in 'original_obs'
            newContent = { original_obs: initialValue }
        }

        // Update the main observation field
        newContent['OBSERVAÇÃO'] = value

        const { error } = await supabase
            .from('registros')
            .update({ observacoes: JSON.stringify(newContent) })
            .eq('id', registroId)

        if (!error) {
            router.refresh()
            setIsEditing(false)
        } else {
            console.error('Error updating observation:', error)
            alert('Erro ao salvar observação')
        }

        setLoading(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault() // Prevent newline
            handleSave()
        }
        if (e.key === 'Escape') {
            setValue(parsedValue)
            setIsEditing(false)
        }
    }

    if (isEditing) {
        return (
            <div className="relative w-full min-w-[200px]">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value)
                        // Auto-grow
                        e.target.style.height = 'auto'
                        e.target.style.height = e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="w-full bg-[#0f1219] text-sm text-slate-200 p-2 rounded border border-indigo-500/50 outline-none focus:ring-1 focus:ring-indigo-500 resize-none overflow-hidden"
                    rows={1}
                />
                {loading && (
                    <div className="absolute right-2 top-2">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="group cursor-pointer min-h-[24px] min-w-[100px] hover:bg-white/5 p-1 -m-1 rounded transition-colors relative"
            title="Clique para editar"
        >
            <span className="text-xs text-slate-400 whitespace-nowrap group-hover:text-indigo-300 transition-colors">
                {value || '-'}
            </span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </span>
        </div>
    )
}
