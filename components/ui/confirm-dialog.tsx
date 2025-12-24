'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancelar',
    variant = 'danger'
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[20px] bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all">
                                <div className="p-6 text-center">
                                    {/* Icon */}
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                                        <AlertTriangle className="h-7 w-7 text-red-500" />
                                    </div>

                                    {/* Title */}
                                    <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                                        {title}
                                    </Dialog.Title>

                                    {/* Message */}
                                    <Dialog.Description className="text-sm text-gray-600 leading-relaxed">
                                        {message}
                                    </Dialog.Description>
                                </div>

                                {/* Buttons */}
                                <div className="border-t border-gray-200/80 flex divide-x divide-gray-200/80">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50/50 active:bg-gray-100/50 transition-all"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        className="flex-1 px-4 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50/50 active:bg-red-100/50 transition-all"
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
