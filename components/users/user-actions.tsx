'use client'

import { useState } from 'react'
import { MoreHorizontal, Trash2, Key, Loader2, X, Edit2 } from 'lucide-react'
import { deleteUser, updateUserPassword, updateUserProfile } from '@/actions/users'
import { useRouter } from 'next/navigation'

interface UserActionsProps {
    userId: string
    userEmail: string
    currentRole: string
}

export default function UserActions({ userId, userEmail, currentRole }: UserActionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [newRole, setNewRole] = useState(currentRole)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleDelete = async () => {
        if (loading) return
        setLoading(true)
        const res = await deleteUser(userId)
        setLoading(false)
        if (res.error) {
            alert('Erro ao excluir: ' + res.error)
        } else {
            setShowDeleteConfirm(false)
            setIsOpen(false)
            router.refresh()
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError(null)

        const res = await updateUserPassword(userId, newPassword)
        setLoading(false)

        if (res.error) {
            setError(res.error)
        } else {
            alert('Senha atualizada com sucesso!')
            setShowPasswordModal(false)
            setIsOpen(false)
            setNewPassword('')
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError(null)

        const res = await updateUserProfile(userId, newRole)
        setLoading(false)

        if (res.error) {
            setError(res.error)
        } else {
            setShowEditModal(false)
            setIsOpen(false)
            router.refresh()
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
                title="Ações"
            >
                <MoreHorizontal className="h-5 w-5" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white py-2 shadow-[0_10px_38px_-10px_rgba(22,23,24,0.35),0_10px_20px_-15px_rgba(22,23,24,0.2)] ring-1 ring-gray-200 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gerenciar</p>
                        </div>
                        <button
                            onClick={() => { setShowEditModal(true); setIsOpen(false); }}
                            className="flex w-full items-center px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <Edit2 className="mr-3 h-4 w-4 text-[#0071e3]" />
                            Editar Perfil
                        </button>
                        <button
                            onClick={() => { setShowPasswordModal(true); setIsOpen(false); }}
                            className="flex w-full items-center px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <Key className="mr-3 h-4 w-4 text-amber-500" />
                            Alterar Senha
                        </button>
                        <button
                            onClick={() => { setShowDeleteConfirm(true); setIsOpen(false); }}
                            className="flex w-full items-center px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="mr-3 h-4 w-4" />
                            Excluir Conta
                        </button>
                    </div>
                </>
            )}


            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white border border-gray-100 rounded-[20px] shadow-2xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">Editar Usuário</h3>
                        <p className="text-xs text-gray-500 mb-6 font-medium">
                            Alterar nível de acesso para: <span className="text-[#0071e3] font-semibold">{userEmail}</span>
                        </p>

                        <form onSubmit={handleProfileUpdate}>
                            <div className="space-y-4 mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Nível de Acesso
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNewRole('controller')}
                                        className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${newRole === 'controller'
                                            ? 'bg-blue-50 border-[#0071e3] text-[#0071e3] ring-1 ring-[#0071e3]'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        Controlador
                                        {newRole === 'controller' && <div className="w-2 h-2 rounded-full bg-[#0071e3]"></div>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewRole('admin')}
                                        className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${newRole === 'admin'
                                            ? 'bg-blue-50 border-[#0071e3] text-[#0071e3] ring-1 ring-[#0071e3]'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        Administrador
                                        {newRole === 'admin' && <div className="w-2 h-2 rounded-full bg-[#0071e3]"></div>}
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-xs mb-4 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-[#0071e3] rounded-xl hover:bg-[#0077ed] shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center active:scale-95 transition-all"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white border border-gray-100 rounded-[20px] shadow-2xl max-w-sm w-full p-6 relative">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Usuário</h3>
                        <p className="text-sm text-gray-500 mb-6 font-medium">
                            Tem certeza que deseja excluir <strong className="text-gray-900">{userEmail}</strong>? Esta ação é irreversível.
                        </p>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-500 shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center active:scale-95 transition-all"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white border border-gray-100 rounded-[20px] shadow-2xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">Alterar Senha</h3>
                        <p className="text-xs text-gray-500 mb-6 font-medium">
                            Redefinir acesso para: <span className="text-[#0071e3] font-semibold">{userEmail}</span>
                        </p>

                        <form onSubmit={handlePasswordUpdate}>
                            <div className="mb-6 space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] border-transparent transition-all text-sm"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            {error && <p className="text-red-500 text-xs mb-4 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-[#0071e3] rounded-xl hover:bg-[#0077ed] shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center active:scale-95 transition-all"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Atualizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
