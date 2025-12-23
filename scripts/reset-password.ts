
import { createAdminClient } from '@/lib/supabase/admin'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function resetPassword() {
    const supabase = createAdminClient()
    const email = 'santosrik75@gmail.com'
    const newPassword = 'password123' // Temporary password

    console.log(`Resetting password for: ${email}...`)

    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
        console.error('User not found.')
        return
    }

    // Confirm email just in case
    if (!user.email_confirmed_at) {
        await supabase.auth.admin.updateUserById(user.id, { email_confirm: true })
        console.log('Email confirmed.')
    }

    const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    )

    if (error) {
        console.error('Error updating password:', error.message)
    } else {
        console.log(`Success! Password set to: ${newPassword}`)
    }
}

resetPassword()
