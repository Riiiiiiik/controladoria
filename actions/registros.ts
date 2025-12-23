'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createRegistro(data: any) {
    const supabaseUser = await createClient()
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()

    if (userError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    const supabase = createAdminClient()

    try {
        const { error } = await supabase
            .from('registros')
            .insert([{ ...data, user_id: user.id }])

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

    const supabase = createAdminClient()

    try {
        const { data: updated, error } = await supabase
            .from('registros')
            .update(data)
            .eq('id', id)
            .select() // Select to confirm update happened

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
