import { createClient } from '@/lib/supabase/server'
import RegistroForm from '@/components/registros/registro-form'
import { redirect } from 'next/navigation'

export default async function EditRegistroPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: registro, error } = await supabase
        .from('registros')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

    if (error || !registro) {
        return <div className="p-8 text-red-500">Registro não encontrado ou você não tem permissão para editá-lo.</div>
    }

    // Logic to handle legacy JSON observations and field mapping
    let obsValue = registro.observacoes || ''
    let extra: any = {}
    try {
        // Try parsing only if it looks like JSON
        if (obsValue.trim().startsWith('{')) {
            extra = JSON.parse(obsValue)
            // If we successfully parsed, we might want to show the 'raw' observation text or a specific field
            // For simplicity in this form, we use the root observation column if it's simple text, 
            // or try to extract a meaningful note if it's JSON. 
            // However, the form saves 'observacoes' as a simple string. 
            // If we display JSON as string, the user will edit JSON. 
            // Let's assume for now we just pass the raw string if it's not empty.
        }
    } catch (e) {
        // Not JSON, just text
    }

    // Normalize data to match form structure
    // We prioritize the column values, but fall back to 'extra' (JSON) values if columns are empty (legacy data support)
    const initialData = {
        id: registro.id,
        data_contato: registro.data_contato,
        meio_confirmacao: registro.meio_confirmacao || extra.meio_confirmacao,
        gestor: registro.gestor || extra.gestor,
        numero_op: registro.numero_op || extra.numero_op,
        tipo: registro.tipo || extra.tipo_contato || 'NFE',
        cedente: registro.cedente || registro.produto, // Legacy: produto was used for cedente sometimes
        sacado: registro.sacado || registro.cliente_nome, // Legacy: cliente_nome was used for sacado
        valor: registro.valor,
        nome_contato: registro.nome_contato || extra.nome_contato,
        telefone: registro.telefone || extra.telefone,
        status: registro.status,
        boleto_status: registro.boleto_status,
        entrega_mercadoria: registro.entrega_mercadoria,
        observacoes: registro.observacoes // Pass raw string
    }

    return (
        <div className="w-full">
            <RegistroForm initialData={initialData} />
        </div>
    )
}
