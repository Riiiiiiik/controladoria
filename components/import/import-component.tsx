'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { getGestorSuggestions } from '@/actions/predict-gestor'

export default function ImportComponent() {
    const supabase = createClient()
    const router = useRouter()

    const [file, setFile] = useState<File | null>(null)
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<{ success: number, error: number } | null>(null)
    const [gestorMap, setGestorMap] = useState<Record<string, string>>({})

    useEffect(() => {
        getGestorSuggestions().then(map => {
            setGestorMap(map)
            console.log('Gestor predictions loaded:', map)
        })
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setData(results.data)
                }
            })
        }
    }

    // Helper to find key case-insensitive
    const findKeyCI = (obj: any, key: string) => {
        const found = Object.keys(obj).find(k => k.toLowerCase().trim() === key.toLowerCase().trim())
        return found ? obj[found] : undefined
    }

    const normalizeStatus = (status: string | null | undefined): string => {
        if (!status) return 'Pendente'
        const s = String(status).toLowerCase().trim()
        if (s.includes('aprovado') || s.includes('pago') || s.includes('ok') || s.includes('recebido')) return 'Aprovado'
        if (s.includes('reprovado') || s.includes('cancelado') || s.includes('recusado') || s.includes('devolvido')) return 'Reprovado'
        return 'Pendente'
    }

    const handleImport = async () => {
        if (!data.length) return
        setLoading(true)
        setResults(null)

        let successCount = 0
        let errorCount = 0

        const chunks = []
        const chunkSize = 50
        for (let i = 0; i < data.length; i += chunkSize) {
            chunks.push(data.slice(i, i + chunkSize))
        }

        for (const chunk of chunks) {
            const formattedData = chunk.map((row: any) => {
                const obsObj: any = {}

                // Safe extraction
                const obs = findKeyCI(row, 'Obs')
                const lastro = findKeyCI(row, 'Lastro')
                const detalhes = findKeyCI(row, 'Detalhes')
                const statusRaw = findKeyCI(row, 'Status')
                const valorRaw = findKeyCI(row, 'Valor')

                // Fields for logic
                const produto = findKeyCI(row, 'Produto') || findKeyCI(row, 'Cedente') || ''
                let gestor = findKeyCI(row, 'Gestor')

                // Predict Gestor if missing
                if (!gestor && produto) {
                    const prediction = gestorMap[produto.trim().toLowerCase()]
                    if (prediction) {
                        gestor = prediction
                    }
                }

                if (obs) obsObj['OBSERVAÇÃO'] = obs
                if (lastro) obsObj['lastro'] = lastro
                if (detalhes) obsObj['detalhes'] = detalhes

                // Helper to return value or undefined (to omit from payload)
                const valOrUndef = (v: any) => v || undefined

                return {
                    data_contato: findKeyCI(row, 'Data') || findKeyCI(row, 'Data Contato') || new Date(),
                    cliente_nome: findKeyCI(row, 'Cliente') || findKeyCI(row, 'Nome') || findKeyCI(row, 'Sacado') || 'Unknown',
                    tipo_contato: findKeyCI(row, 'Tipo') || 'Outro',
                    produto: produto,
                    valor: valorRaw ? parseFloat(String(valorRaw).replace('R$', '').replace(/\./g, '').replace(',', '.')) : 0,
                    status: normalizeStatus(statusRaw), // Must be valid Enum
                    observacoes: JSON.stringify(obsObj),
                    meio_confirmacao: valOrUndef(findKeyCI(row, 'MEIO DE CONFIRMAÇÃO') || findKeyCI(row, 'Meio de Confirmação') || findKeyCI(row, 'Meio')) || 'WhatsApp',
                    gestor: valOrUndef(gestor),
                    numero_op: valOrUndef(findKeyCI(row, 'OP') || findKeyCI(row, 'Nº OP')),
                    nome_contato: valOrUndef(findKeyCI(row, 'Contato')),
                    cedente: valOrUndef(findKeyCI(row, 'Cedente')),
                    sacado: findKeyCI(row, 'Sacado') || findKeyCI(row, 'Cliente') || undefined,
                    boleto_status: 'Email', // Default matching form to satisfy constraints
                    entrega_mercadoria: 'Entregue' // Default matching form to satisfy constraints
                }
            })

            console.log('IMPORT DEBUG: Inserting Chunks:', formattedData) // DEBUG log

            const { error } = await supabase.from('registros').insert(formattedData)

            if (error) {
                console.error('Import error', error)
                errorCount += chunk.length
            } else {
                successCount += chunk.length
            }
        }

        setLoading(false)
        setResults({ success: successCount, error: errorCount })
        if (successCount > 0) {
            router.refresh()
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Import Registros from CSV
            </h3>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>Upload a CSV file with headers: Data, Cliente, Tipo, Produto, Valor, Status, Obs.</p>
            </div>

            <div className="mt-5">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">CSV, XLS (converted to CSV)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                </div>
            </div>

            {file && (
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</span>
                    <span className="text-sm text-gray-500">{data.length} records found</span>
                </div>
            )}

            <div className="mt-5 sm:flex sm:justify-end">
                <button
                    type="button"
                    disabled={!data.length || loading}
                    onClick={handleImport}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Import Data
                </button>
            </div>

            {results && (
                <div className={`mt-4 p-4 rounded-md ${results.error > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {results.error > 0 ? <AlertCircle className="h-5 w-5 text-yellow-400" /> : <CheckCircle className="h-5 w-5 text-green-400" />}
                        </div>
                        <div className="ml-3">
                            <h3 className={`text-sm font-medium ${results.error > 0 ? 'text-yellow-800' : 'text-green-800'}`}>
                                Import Completed
                            </h3>
                            <div className={`mt-2 text-sm ${results.error > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                                <p>{results.success} records imported successfully.{results.error > 0 && ` ${results.error} failed.`}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
