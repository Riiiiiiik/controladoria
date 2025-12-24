'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import EditableObservation from './editable-observation'
import RegistroSidePanel from './registro-side-panel'
import { Calendar, Edit2, Download, Search } from 'lucide-react'
import Papa from 'papaparse'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

interface RegistrosTableProps {
    registros: any[]
    userRole?: string
    availableYears: string[]
    selectedYear: string
}

export default function RegistrosTable({ registros, userRole = 'controller', availableYears, selectedYear }: RegistrosTableProps) {
    const searchParams = useSearchParams()
    const currentUserId = searchParams.get('userId')

    // Pre-process records to avoid expensive logic inside the map
    const processedRegistros = useMemo(() => {
        return registros.map(registro => {
            let extra: any = {}
            try {
                extra = JSON.parse(registro.observacoes || '{}')
            } catch (e) {
                extra = { original_obs: registro.observacoes }
            }

            const recordYear = registro.data_contato ? registro.data_contato.split('-')[0] : ''
            const isYearMismatch = recordYear !== selectedYear

            const meio = extra.meio_confirmacao || registro.meio_confirmacao || '-'
            const meioLower = meio.toString().toLowerCase()
            let meioClass = "bg-gray-100 text-gray-400 border-gray-200"
            if (meioLower.includes('email')) meioClass = "bg-blue-50 text-blue-500 border-blue-100"
            else if (meioLower.includes('whats')) meioClass = "bg-green-50 text-green-600 border-green-100" // WhatsApp green usually
            else if (meioLower.includes('lig')) meioClass = "bg-purple-50 text-purple-500 border-purple-100"
            else if (meioLower.includes('lastro')) meioClass = "bg-orange-50 text-orange-500 border-orange-100"

            let status = registro.status || 'Pendente'
            if (status.toLowerCase() === 'rejeitado') status = 'Reprovado'

            const statusLower = status.toLowerCase()
            let statusClass = "bg-gray-100 text-gray-500 border-gray-200"
            if (statusLower.includes('aprov')) statusClass = "bg-emerald-50 text-emerald-600 border-emerald-100"
            else if (statusLower.includes('reprov') || statusLower.includes('cancel') || statusLower.includes('rejeita')) statusClass = "bg-red-50 text-red-600 border-red-100"
            else if (statusLower.includes('pendente')) statusClass = "bg-amber-50 text-amber-600 border-amber-100"

            return {
                ...registro,
                extra,
                recordYear,
                isYearMismatch,
                meio,
                meioClass,
                status,
                statusClass
            }
        })
    }, [registros, selectedYear])

    // Search filter state
    const [searchTerm, setSearchTerm] = useState('')
    const [editingRegistro, setEditingRegistro] = useState<any>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)

    const handleEditClick = (registro: any) => {
        // Prepare initial data if needed, similar to how page.tsx did it, 
        // but since we have processedRegistros which already merged 'extra',
        // we might want to construct a clean object matching the form expectations.
        // The table's 'registro' has everything merged in 'extra', but form expects flat fields.
        // Let's rely on processedRegistros being 'flat enough' or construct it here.

        // processedRegistros returns an object where fields like 'gestor' might be in 'extra' if original was null
        // But the form expects 'gestor' at root.
        // Fortunately processedRegistros already populates root fields from API, 
        // AND validation logic in table row relied on (registro.extra.gestor || registro.gestor).

        // Let's create a normalized object for the form
        const normalized = {
            id: registro.id,
            data_contato: registro.data_contato,
            meio_confirmacao: registro.meio, // computed in map
            gestor: registro.extra.gestor || registro.gestor,
            numero_op: registro.extra.numero_op || registro.numero_op,
            tipo: registro.tipo_contato || registro.tipo,
            cedente: registro.produto || registro.cedente,
            sacado: registro.cliente_nome || registro.sacado,
            valor: registro.valor,
            nome_contato: registro.extra.nome_contato || registro.nome_contato,
            telefone: registro.extra.telefone || registro.telefone,
            status: registro.status,
            boleto_status: registro.boleto_status,
            entrega_mercadoria: registro.entrega_mercadoria,
            observacoes: registro.observacoes
        }

        setEditingRegistro(normalized)
        setIsPanelOpen(true)
    }

    const filteredRegistros = useMemo(() => {
        if (!searchTerm) return processedRegistros
        const term = searchTerm.toLowerCase()
        return processedRegistros.filter(r =>
            (r.cedente || '').toLowerCase().includes(term) ||
            (r.sacado || '').toLowerCase().includes(term) ||
            (r.numero_op || '').toLowerCase().includes(term) ||
            (r.gestor || '').toLowerCase().includes(term)
        )
    }, [processedRegistros, searchTerm])

    // Scroll Synchronization Logic
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const topScrollRef = useRef<HTMLDivElement>(null)
    const [tableWidth, setTableWidth] = useState(3185) // Increased width for larger numeric columns
    const [containerWidth, setContainerWidth] = useState(0)

    useEffect(() => {
        const updateWidths = () => {
            if (tableContainerRef.current) {
                setContainerWidth(tableContainerRef.current.offsetWidth)
            }
        }
        updateWidths()
        window.addEventListener('resize', updateWidths)
        return () => window.removeEventListener('resize', updateWidths)
    }, [])

    const handleTopScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollLeft = e.currentTarget.scrollLeft
        }
    }

    const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (topScrollRef.current) {
            topScrollRef.current.scrollLeft = e.currentTarget.scrollLeft
        }
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-'
        const parts = dateStr.split('-')
        if (parts.length !== 3) return dateStr
        const [year, month, day] = parts
        return `${day}/${month}/${year}`
    }

    const handleExport = () => {
        const exportData = filteredRegistros.map(r => ({
            Data: formatDate(r.data_contato),
            'Meio Conf.': r.meio,
            Gestor: r.extra.gestor || r.gestor || '-',
            'Nº OP': r.extra.numero_op || r.numero_op || '-',
            Tipo: r.tipo_contato || r.tipo || '-',
            Cedente: r.produto || r.cedente || '-',
            Sacado: r.cliente_nome || r.sacado || '-',
            'Valor (R$)': r.valor ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2 }).format(r.valor) : '0,00',
            Contato: r.extra.nome_contato || r.nome_contato || '-',
            Status: r.status,
            'Observação': r.extra.original_obs || r.extra['OBSERVAÇÃO'] || r.extra['Observação'] || ''
        }))

        const csv = Papa.unparse(exportData)
        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `registros_${selectedYear}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const registro = filteredRegistros[index]
        if (!registro) return null

        return (
            <div
                style={style}
                className={`flex items-center border-b border-apple-border hover:bg-apple-accent/5 transition-colors group ${registro.isYearMismatch ? 'bg-red-50' : 'bg-white'}`}
            >
                <div className="flex-none w-[45px] px-2 py-3 text-center">
                    <button
                        onClick={() => handleEditClick(registro)}
                        className="inline-flex p-1.5 text-apple-accent hover:text-white hover:bg-apple-accent rounded-lg transition-all duration-200"
                        title="Editar"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="flex-none w-[100px] px-4 py-3 text-sm text-apple-text-secondary font-mono">
                    {formatDate(registro.data_contato)}
                    {registro.isYearMismatch && <span className="text-red-500 font-bold ml-1 text-[10px]">(!{registro.recordYear})</span>}
                </div>
                <div className="flex-none w-[110px] px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${registro.meioClass}`}>
                        {registro.meio}
                    </span>
                </div>
                <div className="flex-none w-[120px] px-4 py-3 text-sm text-apple-text-primary truncate font-medium">{registro.extra.gestor || registro.gestor || '-'}</div>
                <div className="flex-none w-[80px] px-2 py-3 text-sm font-mono text-apple-text-secondary italic text-center truncate" title={registro.extra.numero_op || registro.numero_op || '-'}>
                    {registro.extra.numero_op || registro.numero_op || '-'}
                </div>
                <div className="flex-none w-[100px] px-4 py-3 text-xs font-bold text-apple-text-secondary uppercase tracking-tighter truncate">{registro.tipo_contato || registro.tipo || '-'}</div>
                <div className="flex-none w-[500px] px-4 py-3 text-sm text-apple-text-primary truncate" title={registro.cedente || ''}>{registro.cedente || '-'}</div>
                <div className="flex-none w-[500px] px-4 py-3 text-sm text-apple-text-primary truncate" title={registro.cliente_nome || registro.sacado || ''}>{registro.cliente_nome || registro.sacado || '-'}</div>
                <div className="flex-none w-[200px] px-4 py-3 text-sm font-mono text-apple-text-primary font-semibold">
                    {registro.valor ? (
                        <div className="flex justify-between items-center w-full">
                            <span className="text-apple-text-secondary text-xs">R$</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(registro.valor)}</span>
                        </div>
                    ) : (
                        <div className="w-full text-right text-apple-text-secondary">-</div>
                    )}
                </div>
                <div className="flex-none w-[120px] px-4 py-3 text-sm text-apple-text-secondary truncate" title={registro.extra.nome_contato || registro.nome_contato || ''}>{registro.extra.nome_contato || registro.nome_contato || '-'}</div>
                <div className="flex-none w-[110px] px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tighter ${registro.statusClass}`}>
                        {registro.status}
                    </span>
                </div>
                <div className="flex-none w-[1200px] px-4 py-3 overflow-hidden text-apple-text-secondary">
                    <EditableObservation
                        registroId={registro.id}
                        initialValue={registro.observacoes}
                        parsedValue={registro.extra.original_obs || registro.extra['OBSERVAÇÃO'] || registro.extra['Observação'] || ''}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full sm:w-auto">
                    {availableYears.map((year) => {
                        const isActive = selectedYear === year
                        const href = currentUserId ? `?userId=${currentUserId}&year=${year}` : `?year=${year}`
                        return (
                            <Link
                                key={year}
                                href={href}
                                className={`
                                    relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                                    ${isActive
                                        ? 'bg-apple-accent text-white shadow-lg shadow-apple-accent/20'
                                        : 'bg-white text-apple-text-secondary hover:bg-gray-50 hover:text-apple-text-primary border border-apple-border'
                                    }
                                `}
                            >
                                <Calendar className={`w-4 h-4 ${isActive ? 'text-white' : 'text-apple-text-secondary'}`} />
                                {year}
                                {isActive && (
                                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-bold">
                                        {registros.length}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <input
                            type="text"
                            placeholder="Buscar registros..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 bg-white border border-apple-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-apple-text-primary focus:border-apple-accent focus:ring-4 focus:ring-apple-accent/10 outline-none transition-all placeholder:text-apple-text-secondary shadow-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-3 text-apple-text-secondary" />
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-apple-text-primary px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-apple-border hover:border-gray-300 shadow-sm"
                    >
                        <Download className="w-4 h-4 text-apple-accent" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Top Scrollbar for sync */}
            <div
                ref={topScrollRef}
                onScroll={handleTopScroll}
                className="w-full overflow-x-auto custom-scrollbar h-2 bg-apple-bg-secondary border-x border-t border-apple-border rounded-t-xl"
                style={{ display: tableWidth > containerWidth ? 'block' : 'none' }}
            >
                <div style={{ width: tableWidth, height: '1px' }}></div>
            </div>

            <div className="bg-white border border-apple-border rounded-b-xl rounded-t-none shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col h-[calc(100vh-280px)] relative overflow-hidden">
                <div
                    ref={tableContainerRef}
                    onScroll={handleTableScroll}
                    className="overflow-x-auto flex-1 w-full scrollbar-hide"
                >
                    <div style={{ minWidth: tableWidth }} className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex-none bg-apple-bg-secondary/90 backdrop-blur-md border-b border-apple-border flex sticky top-0 z-20">
                            <div className="flex-none w-[45px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center"></div>
                            <div className="flex-none w-[100px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Data</div>
                            <div className="flex-none w-[110px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Meio</div>
                            <div className="flex-none w-[120px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Gestor</div>
                            <div className="flex-none w-[80px] px-2 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Nº OP</div>
                            <div className="flex-none w-[100px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Tipo</div>
                            <div className="flex-none w-[500px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Cedente</div>
                            <div className="flex-none w-[500px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Sacado</div>
                            <div className="flex-none w-[200px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Valor</div>
                            <div className="flex-none w-[120px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Contato</div>
                            <div className="flex-none w-[110px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Status</div>
                            <div className="flex-none w-[1200px] px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-secondary text-center">Observação</div>
                        </div>

                        {/* Body - Virtualized */}
                        <div className="flex-1">
                            {filteredRegistros.length > 0 ? (
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <List
                                            height={height}
                                            itemCount={filteredRegistros.length}
                                            itemSize={54}
                                            width={width}
                                            className="scrollbar-hide"
                                        >
                                            {Row}
                                        </List>
                                    )}
                                </AutoSizer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-30">
                                    <Search className="w-12 h-12 text-slate-600" />
                                    <p className="text-sm text-slate-500 font-medium">Nenhum registro encontrado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Side Panel for Editing */}
            <RegistroSidePanel
                isOpen={isPanelOpen}
                onClose={() => {
                    setIsPanelOpen(false)
                    setEditingRegistro(null)
                    // Trigger refresh of data if needed - but createRegistro/updateRegistro currently call revalidatePath.
                    // However, revalidatePath re-renders server components.
                    // For the table to update without full page reload, we rely on Next.js handling the server action response.
                    // Ideally we should force a router.refresh() here just in case.
                    // A cleaner way is passing a prop or using router in parent, but let's try auto-refresh from server action first.
                    // Actually, to be safe:
                    window.location.reload() // Force reload to see updates since we are not using full optimistic state yet.
                    // Or even better: router.refresh() if we had router.
                }}
                initialData={editingRegistro}
            />
        </div>
    )
}
