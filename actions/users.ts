'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    const supabase = createAdminClient()

    // Create user in Auth
    const { data: { user }, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    })

    if (error) {
        return { error: error.message }
    }

    if (user) {
        // Create profile (Trigger might handle this, but we want to set role specifically)
        // If trigger sets default to 'controller', we update it here or rely on trigger + update.
        // Assuming trigger creates it. We update role.

        // Wait a bit for trigger? Or just upsert.
        // Better: Upsert into profiles.
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: email,
                role: role
            })

        if (profileError) {
            return { error: profileError.message }
        }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}

export async function deleteUser(userId: string) {
    const supabase = createAdminClient()

    // 1. Delete associated records (Manual Cascade)
    const { error: registrosError } = await supabase
        .from('registros')
        .delete()
        .eq('user_id', userId)

    if (registrosError) {
        return { error: 'Erro ao excluir registros do usuário: ' + registrosError.message }
    }

    // 2. Delete profile
    const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

    if (profileError) {
        return { error: 'Erro ao excluir perfil do usuário: ' + profileError.message }
    }

    // 3. Delete from Auth
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}

export async function updateUserPassword(userId: string, password: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}
export async function updateUserProfile(userId: string, role: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}
