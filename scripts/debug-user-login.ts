
import { createAdminClient } from '@/lib/supabase/admin'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function debugUser() {
    const supabase = createAdminClient()
    const email = 'santosrik75@gmail.com'

    console.log(`Checking user: ${email}...`)

    // List users to find the specific one
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error listing users:', error.message)
        return
    }

    const user = data.users.find(u => u.email === email)

    if (!user) {
        console.error('User not found in Supabase Auth!')
        console.log('Available users:', data.users.map(u => u.email))
    } else {
        console.log('User found:')
        console.log('ID:', user.id)
        console.log('Email Confirmed At:', user.email_confirmed_at)
        console.log('Last Sign In:', user.last_sign_in_at)
        console.log('Role:', user.role)

        if (!user.email_confirmed_at) {
            console.log('WARNING: Email NOT confirmed. Attempting to confirm...')
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { email_confirm: true }
            )
            if (updateError) console.error('Failed to auto-confirm:', updateError.message)
            else console.log('User auto-confirmed successfully! Try logging in now.')
        }
    }
}

debugUser()
