'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import RegistroForm from './registro-form'

interface RegistroSidePanelProps {
    isOpen: boolean
    onClose: () => void
    initialData?: any
}

export default function RegistroSidePanel({ isOpen, onClose, initialData }: RegistroSidePanelProps) {
    const [isVisible, setIsVisible] = useState(false)

    // Handle animation timing
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isVisible && !isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Panel */}
            <div
                className={`relative w-full max-w-2xl h-full bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onClose}
                        className="p-2 text-apple-text-secondary hover:text-apple-text-primary bg-apple-bg-secondary hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {/* We pass a key to force re-render when initialData changes or when panel opens/closes */}
                    <RegistroForm
                        key={initialData?.id || 'new'}
                        initialData={initialData}
                        onSuccess={onClose}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    )
}
