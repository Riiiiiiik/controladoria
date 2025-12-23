
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const url = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!adminKey || !url) process.exit(1)

const supabase = createClient(url, adminKey)

async function main() {
    const { count, error } = await supabase
        .from('registros')
        .select('*', { count: 'exact', head: true })

    console.log('Total Records:', count)
    console.log('Error:', error)
}

main()
