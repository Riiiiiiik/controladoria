'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Upload, FileUp, AlertCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'

export default function HistoryImportPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isParsing, setIsParsing] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            setPreviewData([])
            setIsParsing(true)
            setStatus('idle')
            setMessage('')

            setTimeout(() => {
                if (selectedFile.name.endsWith('.csv')) {
                    parseCSV(selectedFile)
                } else if (selectedFile.name.match(/\.xlsx?$/)) {
                    parseExcel(selectedFile)
                } else {
                    setStatus('error')
                    setMessage('Unsupported file format. Please upload .csv, .xlsx, or .xls')
                    setIsParsing(false)
                }
            }, 100)

            e.target.value = ''
        }
    }

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setPreviewData(results.data.slice(0, 5) as any[])
                setStatus('idle')
                setMessage('')
                setIsParsing(false)
            },
            error: (error: any) => {
                setStatus('error')
                setMessage('Error parsing CSV: ' + error.message)
                setIsParsing(false)
            }
        })
    }

    const parseExcel = async (file: File) => {
        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data, { cellDates: true })
            const worksheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[worksheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                raw: true
            })

            const formattedData = jsonData.map((row: any) => {
                const newRow: any = { ...row }
                Object.keys(newRow).forEach(key => {
                    const val = newRow[key]
                    if (val instanceof Date) {
                        const day = val.getUTCDate().toString().padStart(2, '0')
                        const month = (val.getUTCMonth() + 1).toString().padStart(2, '0')
                        const year = val.getUTCFullYear()
                        newRow[key] = `${day}/${month}/${year}`
                    }
                })
                return newRow
            })

            setPreviewData(formattedData.slice(0, 5) as any[])
            setStatus('idle')
            setMessage('')
        } catch (error: any) {
            setStatus('error')
            setMessage('Error parsing Excel: ' + error.message)
        } finally {
            setIsParsing(false)
        }
    }

    const handleImport = async () => {
        if (!file) return

        setIsLoading(true)
        setStatus('idle')

        const submitImport = async (data: any[]) => {
            try {
                const response = await fetch('/api/registros/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ records: data }),
                })

                const resData = await response.json()

                if (response.ok) {
                    setStatus('success')
                    setMessage(`Successfully imported ${resData.count} records. Redirecting...`)
                    setFile(null)
                    setPreviewData([])
                    router.refresh()
                    setTimeout(() => router.push('/dashboard'), 1500)
                } else {
                    setStatus('error')
                    setMessage(resData.error || 'Failed to import records.')
                }
            } catch (error) {
                setStatus('error')
                setMessage('Network error during import.')
            } finally {
                setIsLoading(false)
            }
        }

        if (file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => submitImport(results.data)
            })
        } else if (file.name.match(/\.xlsx?$/)) {
            try {
                const data = await file.arrayBuffer()
                const workbook = XLSX.read(data, { cellDates: true })
                const worksheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true })
                const formattedData = jsonData.map((row: any) => {
                    const newRow: any = { ...row }
                    Object.keys(newRow).forEach(key => {
                        const val = newRow[key]
                        if (val instanceof Date) {
                            const day = val.getUTCDate().toString().padStart(2, '0')
                            const month = (val.getUTCMonth() + 1).toString().padStart(2, '0')
                            const year = val.getUTCFullYear()
                            newRow[key] = `${day}/${month}/${year}`
                        }
                    })
                    return newRow
                })
                submitImport(formattedData)
            } catch (e) {
                setIsLoading(false)
                setStatus('error')
                setMessage('Failed to process Excel file for import.')
            }
        }
    }

    return (
        <div className="max-w-5xl w-full mx-auto space-y-8 pb-10">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Importar Histórico</h1>
                <p className="text-[13px] text-gray-500 leading-relaxed">Faça upload de arquivos CSV ou Excel para processar registros em lote.</p>
            </header>

            <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="bg-white px-8 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Formato Requerido:</span>
                        <div className="flex flex-wrap gap-2">
                            {['Data', 'Cliente', 'Tipo', 'Produto', 'Valor', 'Status'].map(label => (
                                <span key={label} className="px-2.5 py-1 bg-gray-50 border border-gray-200/50 rounded-md text-[11px] text-gray-600 font-medium">
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full border border-red-100 bg-white text-red-600 text-[11px] font-semibold tracking-wide shadow-sm hover:bg-red-50 hover:border-red-200 transition-all duration-200 active:scale-95"
                        title="Resetar Banco de Dados"
                    >
                        <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                        RESETAR BANCO
                    </button>
                </div>

                <div className="p-8 md:p-12">
                    {!file ? (
                        <label className="relative group cursor-pointer flex flex-col items-center justify-center border border-dashed border-gray-300 hover:border-[#0071e3] bg-gray-50/50 hover:bg-blue-50/10 rounded-[18px] py-16 transition-all duration-300">
                            <input
                                type="file"
                                className="hidden"
                                accept=".csv, .xlsx, .xls"
                                onChange={handleFileChange}
                            />
                            <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-[#0071e3] shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300 mb-5">
                                <FileUp className="w-7 h-7" />
                            </div>
                            <h3 className="text-[15px] font-medium text-gray-900 mb-1">Clique para selecionar um arquivo</h3>
                            <p className="text-gray-400 text-sm mb-5">ou arraste e solte o documento aqui</p>
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-gray-300"></div> CSV</span>
                                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-gray-300"></div> XLSX</span>
                            </div>
                        </label>
                    ) : (
                        <div className="border border-gray-200 rounded-[18px] p-8 bg-white text-center shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 text-green-600 mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
                            <p className="text-sm text-gray-500 mb-6 mt-1">Arquivo pronto para processamento</p>

                            <button
                                onClick={() => { setFile(null); setPreviewData([]); }}
                                className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                            >
                                Remover arquivo
                            </button>
                        </div>
                    )}

                    {/* Loading/Status Messages */}
                    {isParsing && (
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-[#0071e3]">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-[13px] font-medium text-gray-500">Lendo e organizando arquivo...</span>
                        </div>
                    )}

                    {status !== 'idle' && !isParsing && (
                        <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${status === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {status === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            <span className="text-sm font-medium">{message}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Section */}
            {previewData.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Preview dos dados</h3>
                        <div className="flex gap-3">
                            <button
                                onClick={handleImport}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-[#0071e3] text-white px-5 py-2.5 rounded-[14px] hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-[13px] shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                {isLoading ? 'Importando...' : 'Confirmar Importação'}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    {Array.from(new Set(previewData.flatMap(Object.keys)))
                                        .filter(h => !['Conf Boleto', 'CONF BOLETO', 'Conf. Boleto', 'Conf Boleto', 'CONF. BOLETO'].includes(h))
                                        .map((header) => (
                                            <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                {header}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {previewData.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        {Array.from(new Set(previewData.flatMap(Object.keys)))
                                            .filter(h => !['Conf Boleto', 'CONF BOLETO', 'Conf. Boleto', 'Conf Boleto', 'CONF. BOLETO'].includes(h))
                                            .map((header) => (
                                                <td key={header} className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap font-medium">
                                                    {row[header]?.toString() || ''}
                                                </td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tamanho Máx.</p>
                    <p className="text-sm font-semibold text-gray-900">25MB por arquivo</p>
                </div>
                <div className="p-5 bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Processamento</p>
                    <p className="text-sm font-semibold text-gray-900">Lote de até 5.000 linhas</p>
                </div>
                <div className="p-5 bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Suporte</p>
                    <p className="text-sm font-semibold text-gray-900">Encoding UTF-8</p>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={async () => {
                    try {
                        setIsLoading(true);
                        const res = await fetch('/api/registros/import', { method: 'DELETE' });
                        if (res.ok) {
                            setStatus('success');
                            setMessage('Banco de dados limpo com sucesso!');
                            setPreviewData([]);
                            setFile(null);
                            router.refresh();
                        } else {
                            setStatus('error');
                            setMessage('Erro ao limpar banco de dados.');
                        }
                    } finally {
                        setIsLoading(false);
                    }
                }}
                title="Resetar Banco de Dados?"
                message="Esta ação apagará TODOS os registros do banco de dados permanentemente. Esta operação não pode ser desfeita."
                confirmText="Resetar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    )
}
