
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const url = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!adminKey || !url) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(url, adminKey)

async function main() {
    const { data, error } = await supabase
        .from('registros')
        .select('id, observacoes')
        .order('id', { ascending: false })
        .limit(10)

    if (error) {
        console.error(error)
        return
    }

    console.log('Last 10 records observations:')
    data.forEach((r: any) => {
        try {
            const obs = JSON.parse(r.observacoes || '{}')
            console.log(`ID ${r.id} Keys:`, Object.keys(obs))
            console.log(`ID ${r.id} 'original_obs':`, obs.original_obs)
            console.log(`ID ${r.id} 'OBSERVAÇÃO':`, obs['OBSERVAÇÃO'])
        } catch (e) {
            console.log(`ID ${r.id}: [Raw String] ${r.observacoes}`)
        }
    })
}

main()
