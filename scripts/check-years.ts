import { createAdminClient } from '../lib/supabase/admin'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function checkYears() {
    const supabase = createAdminClient()
    let allData: any[] = []
    let page = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
        const { data, error } = await supabase
            .from('registros')
            .select('data_contato')
            .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) {
            console.error('Error:', error)
            break
        }

        if (data && data.length > 0) {
            allData = [...allData, ...data]
            if (data.length < pageSize) hasMore = false
            else page++
        } else {
            hasMore = false
        }
    }

    const years = new Set(allData.map(r => r.data_contato?.split('-')[0]).filter(Boolean))
    console.log('Detected years in DB:', Array.from(years))

    // Count per year
    const counts: any = {}
    allData.forEach(r => {
        const y = r.data_contato?.split('-')[0]
        if (y) counts[y] = (counts[y] || 0) + 1
    })
    console.log('Counts per year:', counts)
}

checkYears()
