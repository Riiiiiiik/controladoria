import { createAdminClient } from '../lib/supabase/admin'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function checkUserYears() {
    const supabase = createAdminClient()

    // Get all users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) {
        console.error('Error fetching users:', usersError)
        return
    }

    for (const user of users) {
        let allData: any[] = []
        let page = 0
        const pageSize = 1000
        let hasMore = true

        while (hasMore) {
            const { data, error } = await supabase
                .from('registros')
                .select('data_contato')
                .eq('user_id', user.id)
                .range(page * pageSize, (page + 1) * pageSize - 1)

            if (error) {
                console.error(`Error for user ${user.email}:`, error)
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
        console.log(`User: ${user.email} (${user.id})`)
        console.log(`  Years in DB:`, Array.from(years))

        const counts: any = {}
        allData.forEach(r => {
            const y = r.data_contato?.split('-')[0]
            if (y) counts[y] = (counts[y] || 0) + 1
        })
        console.log(`  Counts:`, counts)
    }
}

checkUserYears()
