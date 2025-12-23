'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Usuário não autenticado')
    }

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    if (!fullName) {
        return { error: 'Nome completo é obrigatório' }
    }

    // We store profile data in Auth Metadata (user_metadata) to avoid schema changes
    const { error: authError } = await supabase.auth.updateUser({
        data: {
            full_name: fullName,
            phone: phone
        }
    })

    if (authError) {
        console.error('Erro ao atualizar metadados de autenticação:', authError)
        return { error: `Erro ao atualizar perfil: ${authError.message}` }
    }

    revalidatePath('/dashboard/profile')
    redirect('/dashboard/profile')
}

export async function updatePassword(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
        return { error: 'Todos os campos são obrigatórios' }
    }

    if (password !== confirmPassword) {
        return { error: 'As senhas não coincidem' }
    }

    if (password.length < 6) {
        return { error: 'A senha deve ter pelo menos 6 caracteres' }
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        console.error('Erro ao atualizar senha:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/profile')
    redirect('/dashboard/profile')
}
