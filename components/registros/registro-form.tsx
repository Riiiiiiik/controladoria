'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { createRegistro, updateRegistro } from '@/actions/registros'
import { consultarCNPJ } from '@/actions/consultas'
import { predictSingleGestor } from '@/actions/predict-gestor'

interface RegistroFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
}

export default function RegistroForm({ initialData, onSuccess, onCancel }: RegistroFormProps = {}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [searchingSacado, setSearchingSacado] = useState(false)
    const [searchingCedente, setSearchingCedente] = useState(false)
    const [sacadoError, setSacadoError] = useState<string | null>(null)
    const [cedenteError, setCedenteError] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        data_contato: initialData?.data_contato || new Date().toISOString().split('T')[0],
        meio_confirmacao: initialData?.meio_confirmacao || 'WhatsApp',
        gestor: initialData?.gestor || '',
        numero_op: initialData?.numero_op || '',
        tipo: initialData?.tipo || 'NFE',
        cedente: initialData?.cedente || '',
        sacado: initialData?.sacado || '',
        valor: initialData?.valor ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(initialData.valor) : '',
        nome_contato: initialData?.nome_contato || '',
        telefone: initialData?.telefone || '',
        status: initialData?.status || 'Pendente',
        boleto_status: initialData?.boleto_status || 'Email',
        entrega_mercadoria: initialData?.entrega_mercadoria || 'Entregue',
        observacoes: initialData?.observacoes || ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        // Clear specific errors when user types
        if (e.target.name === 'sacado') setSacadoError(null)
        if (e.target.name === 'cedente') setCedenteError(null)
    }

    // Helper for formatting phone
    const formatTelefone = (val: string) => {
        const cleanValue = val.replace(/\D/g, '')
        if (cleanValue.length === 11) {
            return cleanValue.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        } else if (cleanValue.length === 10) {
            return cleanValue.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
        }
        return val // Return original if not 10/11 digits
    }

    const handleSacadoBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const valor = e.target.value
        const cleanValue = valor.replace(/\D/g, '')

        // Logic for CPF (11 digits) - Only formatting, no API lookup available freely for names
        if (cleanValue.length === 11) {
            const cpfFormatted = cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
            setFormData(prev => ({ ...prev, sacado: cpfFormatted }))
            return
        }

        // Logic for CNPJ (14 digits) - Lookup API
        if (cleanValue.length === 14) {
            setSearchingSacado(true)
            setSacadoError(null)
            const resultado = await consultarCNPJ(cleanValue)

            if (resultado.success && resultado.dados) {
                setFormData(prev => ({
                    ...prev,
                    sacado: resultado.dados.razao_social,
                    telefone: resultado.dados.telefone ? formatTelefone(resultado.dados.telefone) : prev.telefone
                }))
            } else {
                setSacadoError(resultado.error || "Erro ao buscar CNPJ")
            }
            setSearchingSacado(false)
        }
    }



    const handleCedenteBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const valor = e.target.value

        // 1. Prediction Logic (Run this regardless of CNPJ length if we have a value)
        if (valor && !formData.gestor) {
            // We can predict based on name even if it's not a full CNPJ yet, 
            // but user flow usually involves typing CNPJ or Name. 
            // If it matches a product name in DB, we predict.
            const suggestedGestor = await predictSingleGestor(valor)
            if (suggestedGestor) {
                setFormData(prev => ({ ...prev, gestor: suggestedGestor }))
            }
        }

        const cleanCNPJ = valor.replace(/\D/g, '')

        if (cleanCNPJ.length === 14) {
            setSearchingCedente(true)
            setCedenteError(null)
            const resultado = await consultarCNPJ(cleanCNPJ)

            if (resultado.success && resultado.dados) {
                // Check prediction again with the OFFICIAL name from CNPJ
                const officialName = resultado.dados.razao_social
                let gestorToSet = formData.gestor

                if (!gestorToSet) {
                    const prediction = await predictSingleGestor(officialName)
                    if (prediction) gestorToSet = prediction
                }

                setFormData(prev => ({
                    ...prev,
                    cedente: officialName,
                    gestor: gestorToSet || prev.gestor
                }))
            } else {
                setCedenteError(resultado.error || "Erro ao buscar CNPJ")
            }
            setSearchingCedente(false)
        }
    }

    const handleTelefoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const formatted = formatTelefone(e.target.value)
        setFormData(prev => ({ ...prev, telefone: formatted }))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
        }
    }

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Remove all non-digits
        const numericValue = value.replace(/\D/g, "")

        // Format as currency
        const options = { minimumFractionDigits: 2 }
        const result = new Intl.NumberFormat("pt-BR", options).format(
            parseFloat(numericValue) / 100
        )

        // Prevent NaN if empty
        if (numericValue === "") {
            setFormData({ ...formData, valor: "" })
        } else {
            setFormData({ ...formData, valor: result })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Parse formatted currency "1.234,56" -> 1234.56
        let valorFloat = 0
        if (formData.valor) {
            const cleanValor = formData.valor.toString().replace(/\./g, '').replace(',', '.')
            valorFloat = parseFloat(cleanValor)
        }



        const payload = {
            ...formData,
            valor: isNaN(valorFloat) ? 0 : valorFloat,
            cliente_nome: formData.sacado,
            produto: formData.tipo,
        }

        let result
        if (initialData?.id) {
            result = await updateRegistro(initialData.id, payload)
        } else {
            result = await createRegistro(payload)
        }

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            // Success!
            if (onSuccess) {
                onSuccess()
            } else {
                router.push('/dashboard')
            }
        }
    }

    return (
        <div className="p-6 max-w-3xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => {
                        if (onCancel) {
                            onCancel()
                        } else {
                            // Smart back: check if coming from user view
                            const referrer = typeof window !== 'undefined' ? document.referrer : ''
                            if (referrer && referrer.includes('userId=')) {
                                router.back()
                            } else {
                                router.push('/dashboard')
                            }
                        }
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all -ml-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    {initialData ? 'Editar Notificação' : 'Nova Notificação'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" className="bg-white border border-gray-100 rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">

                {/* Section 1: Detalhes */}
                <div className="p-6 pb-4">
                    <h3 className="text-[15px] font-semibold text-gray-900 tracking-tight mb-4">Detalhes da Notificação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                        <div className="md:col-span-4">
                            <label htmlFor="meio_confirmacao" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Meio Confirmação</label>
                            <div className="relative">
                                <select
                                    id="meio_confirmacao"
                                    name="meio_confirmacao"
                                    value={formData.meio_confirmacao}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all appearance-none cursor-pointer hover:bg-gray-100"
                                >
                                    <option>WhatsApp</option>
                                    <option>Email</option>
                                    <option>Ligação</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-4">
                            <label htmlFor="numero_op" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Nº OP</label>
                            <input
                                id="numero_op"
                                type="text"
                                name="numero_op"
                                value={formData.numero_op}
                                onChange={handleChange}
                                placeholder="0000"
                                autoComplete="off"
                                className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all hover:bg-gray-100 focus:hover:bg-white"
                            />
                        </div>

                        <div className="md:col-span-4">
                            <label htmlFor="tipo" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Tipo</label>
                            <div className="relative">
                                <select
                                    id="tipo"
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all appearance-none cursor-pointer hover:bg-gray-100"
                                >
                                    <option>NFE</option>
                                    <option>Contrato</option>
                                    <option>Cheque</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-100 mx-6"></div>

                {/* Section 2: Sacado e Valor */}
                <div className="p-6 pb-4">
                    <h3 className="text-[15px] font-semibold text-gray-900 tracking-tight mb-4">Sacado e Valor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                        <div className="md:col-span-6">
                            <label htmlFor="cedente" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Cedente (Apenas CNPJ)</label>
                            <div className="relative">
                                <input
                                    id="cedente"
                                    type="text"
                                    name="cedente"
                                    value={formData.cedente}
                                    onChange={handleChange}
                                    onBlur={handleCedenteBlur}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Digite o CNPJ"
                                    autoComplete="off"
                                    className={`w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all hover:bg-gray-100 focus:hover:bg-white
                                        ${cedenteError ? 'ring-2 ring-red-500/50 bg-red-50' : 'focus:ring-[#0071e3]'}
                                    `}
                                />
                                {searchingCedente && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader2 className="h-4 w-4 animate-spin text-[#0071e3]" />
                                    </div>
                                )}
                            </div>
                            {cedenteError && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{cedenteError}</p>
                            )}
                        </div>

                        <div className="md:col-span-6">
                            <label htmlFor="gestor" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Gestor Responsável</label>
                            <input
                                id="gestor"
                                type="text"
                                name="gestor"
                                value={formData.gestor}
                                onChange={handleChange}
                                autoComplete="off"
                                className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all hover:bg-gray-100 focus:hover:bg-white"
                            />
                        </div>

                        <div className="md:col-span-8">
                            <label htmlFor="sacado" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Sacado (Nome / CPF / CNPJ)</label>
                            <div className="relative">
                                <input
                                    id="sacado"
                                    type="text"
                                    name="sacado"
                                    value={formData.sacado}
                                    onChange={handleChange}
                                    onBlur={handleSacadoBlur}
                                    onKeyDown={handleKeyDown}
                                    required
                                    placeholder="Digite Nome, CPF ou CNPJ"
                                    autoComplete="off"
                                    className={`w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all hover:bg-gray-100 focus:hover:bg-white
                                        ${sacadoError ? 'ring-2 ring-red-500/50 bg-red-50' : 'focus:ring-[#0071e3]'}
                                    `}
                                />
                                {searchingSacado && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader2 className="h-4 w-4 animate-spin text-[#0071e3]" />
                                    </div>
                                )}
                            </div>
                            {sacadoError && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{sacadoError}</p>
                            )}
                        </div>

                        <div className="md:col-span-4">
                            <label htmlFor="valor" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Valor (R$)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-medium text-xs">R$</span>
                                </div>
                                <input
                                    id="valor"
                                    type="text"
                                    name="valor"
                                    value={formData.valor}
                                    onChange={handleValorChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="0,00"
                                    autoComplete="off"
                                    className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 pl-9 pr-3 text-[14px] font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all placeholder:text-gray-400 hover:bg-gray-100 focus:hover:bg-white"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-6">
                            <label htmlFor="nome_contato" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Nome do Contato</label>
                            <input
                                id="nome_contato"
                                type="text"
                                name="nome_contato"
                                value={formData.nome_contato}
                                onChange={handleChange}
                                autoComplete="off"
                                className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all hover:bg-gray-100 focus:hover:bg-white"
                            />
                        </div>

                        <div className="md:col-span-6">
                            <label htmlFor="telefone" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Telefone</label>
                            <input
                                id="telefone"
                                type="text"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                onBlur={handleTelefoneBlur}
                                onKeyDown={handleKeyDown}
                                placeholder="(00) 00000-0000"
                                autoComplete="off"
                                className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all hover:bg-gray-100 focus:hover:bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-100 mx-6"></div>

                {/* Section 3: Status */}
                <div className="p-6 pb-4">
                    <h3 className="text-[15px] font-semibold text-gray-900 tracking-tight mb-4">Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                        <div className="md:col-span-4">
                            <label htmlFor="status" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Status</label>
                            <div className="relative">
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 pl-3 pr-9 text-[14px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all appearance-none cursor-pointer hover:bg-gray-100"
                                >
                                    <option>Pendente</option>
                                    <option>Aprovado</option>
                                    <option>Reprovado</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                                <div className={`absolute top-3.5 right-9 w-2 h-2 rounded-full pointer-events-none bg-current
                                    ${formData.status === 'Pendente' ? 'text-amber-400' : ''}
                                    ${formData.status === 'Aprovado' ? 'text-emerald-500' : ''}
                                    ${formData.status === 'Reprovado' ? 'text-red-500' : ''}
                                `}></div>
                            </div>
                        </div>

                        <div className="md:col-span-4">
                            <label htmlFor="boleto_status" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Boleto (Envio)</label>
                            <div className="relative">
                                <select
                                    id="boleto_status"
                                    name="boleto_status"
                                    value={formData.boleto_status}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all appearance-none cursor-pointer hover:bg-gray-100"
                                >
                                    <option>Email</option>
                                    <option>WhatsApp</option>
                                    <option>Cedente</option>
                                    <option>Não Aplica</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-4">
                            <label htmlFor="entrega_mercadoria" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Mercadoria</label>
                            <div className="relative">
                                <select
                                    id="entrega_mercadoria"
                                    name="entrega_mercadoria"
                                    value={formData.entrega_mercadoria}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAFAFA] border-transparent rounded-xl h-10 px-3 text-[14px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all appearance-none cursor-pointer hover:bg-gray-100"
                                >
                                    <option>Entregue</option>
                                    <option>Não Entregue</option>
                                    <option>Não Identificado</option>
                                    <option>Não Aplica</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-12">
                            <label htmlFor="observacoes" className="block text-[13px] font-medium text-gray-600 mb-1.5 ml-1">Observações</label>
                            <textarea
                                id="observacoes"
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                className="w-full bg-[#FAFAFA] border-transparent rounded-xl p-3 text-[14px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all h-24 resize-none hover:bg-gray-100 focus:hover:bg-white"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="px-6 pb-4">
                        <div className="text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => {
                            if (onCancel) onCancel()
                            else {
                                // Smart back: check if coming from user view
                                const referrer = typeof window !== 'undefined' ? document.referrer : ''
                                if (referrer && referrer.includes('userId=')) {
                                    router.back()
                                } else {
                                    router.push('/dashboard')
                                }
                            }
                        }}
                        className="px-5 py-2 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-medium rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,113,227,0.3)] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Salvar Notificação')}
                    </button>
                </div>
            </form>
        </div>
    )
}
