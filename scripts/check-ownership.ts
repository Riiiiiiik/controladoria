import { createAdminClient } from '../lib/supabase/admin'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function checkOwnership() {
    const supabase = createAdminClient()

    const { data: records, error } = await supabase
        .from('registros')
        .select('id, data_contato, user_id')
        .gte('data_contato', '2024-01-01')
        .lte('data_contato', '2024-12-31')
        .limit(10)


    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Sample 2024 records:')
    records.forEach(r => console.log(`ID: ${r.id}, Date: ${r.data_contato}, UserID: ${r.user_id}`))
}

checkOwnership()
