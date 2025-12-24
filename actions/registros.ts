'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// SECURITY: Input validation schemas
const RegistroSchema = z.object({
    data_contato: z.string().min(1, 'Data é obrigatória'),
    cliente_nome: z.string().min(1, 'Nome do cliente é obrigatório').max(255),
    tipo_contato: z.string().optional(),
    produto: z.string().optional(),
    cedente: z.string().optional(),
    sacado: z.string().optional(),
    valor: z.number().nonnegative('Valor deve ser positivo').optional(),
    status: z.enum(['Pendente', 'Aprovado', 'Reprovado']).optional(),
    gestor: z.string().optional(),
    numero_op: z.string().optional(),
    nome_contato: z.string().optional(),
    telefone: z.string().optional(),
    observacoes: z.string().optional(),
    meio_confirmacao: z.string().optional(),
    boleto_status: z.string().optional(),
    entrega_mercadoria: z.string().optional(),
})

export async function createRegistro(data: any) {
    const supabaseUser = await createClient()
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()

    if (userError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    // SECURITY: Validate input
    const validated = RegistroSchema.safeParse(data)
    if (!validated.success) {
        return { error: 'Dados inválidos: ' + validated.error.issues.map((e: any) => e.message).join(', ') }
    }

    const supabase = createAdminClient()

    try {
        const { error } = await supabase
            .from('registros')
            .insert([{ ...validated.data, user_id: user.id }])

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/dashboard')
        return { success: true }
    } catch (e) {
        return { error: 'Failed to create record' }
    }
}

export async function updateRegistro(id: string, data: any) {
    const supabaseUser = await createClient()
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()

    if (userError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    // SECURITY: Validate input (partial schema for updates)
    const validated = RegistroSchema.partial().safeParse(data)
    if (!validated.success) {
        return { error: 'Dados inválidos: ' + validated.error.issues.map((e: any) => e.message).join(', ') }
    }

    // SECURITY: Check if user is admin
    const { data: profile } = await supabaseUser
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    const supabase = createAdminClient()

    try {
        // Build query with ownership check for non-admins
        let query = supabase
            .from('registros')
            .update(validated.data)
            .eq('id', id)

        // SECURITY: Non-admins can only edit their own records
        if (!isAdmin) {
            query = query.eq('user_id', user.id)
        }

        const { data: updated, error } = await query.select()

        if (error) {
            return { error: error.message }
        }

        if (!updated || updated.length === 0) {
            return { error: 'Registro não encontrado ou você não tem permissão para editá-lo.' }
        }

        revalidatePath('/dashboard')
        return { success: true }
    } catch (e) {
        return { error: 'Failed to update record' }
    }
}
