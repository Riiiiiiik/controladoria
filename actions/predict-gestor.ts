'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getGestorSuggestions() {
    const supabase = createAdminClient()

    // Fetch all records with both produto (cedente) and gestor populated
    const { data, error } = await supabase
        .from('registros')
        .select('produto, gestor')
        .not('produto', 'is', null)
        .not('gestor', 'is', null)
        .neq('produto', '')
        .neq('gestor', '')

    if (error || !data) {
        console.error('Error fetching suggestions:', error)
        return {}
    }

    // Map to store frequency: { 'Cedente Name': { 'Gestor A': 10, 'Gestor B': 2 } }
    const frequencyMap: Record<string, Record<string, number>> = {}

    data.forEach(record => {
        const cedente = record.produto?.trim()
        const gestor = record.gestor?.trim()

        if (cedente && gestor) {
            // Initialize if not exists
            if (!frequencyMap[cedente]) {
                frequencyMap[cedente] = {}
            }
            if (!frequencyMap[cedente][gestor]) {
                frequencyMap[cedente][gestor] = 0
            }
            frequencyMap[cedente][gestor]++
        }
    })

    // Convert to simple map: { 'Cedente Name': 'Most Frequent Gestor' }
    const predictionMap: Record<string, string> = {}

    Object.keys(frequencyMap).forEach(cedente => {
        const gestors = frequencyMap[cedente]
        let topGestor = ''
        let maxCount = -1

        Object.keys(gestors).forEach(gestor => {
            if (gestors[gestor] > maxCount) {
                maxCount = gestors[gestor]
                topGestor = gestor
            }
        })

        if (topGestor) {
            predictionMap[cedente.toLowerCase()] = topGestor // storing as lowercase for easy case-insensitive lookup
        }
    })

    return predictionMap
}

export async function predictSingleGestor(cedenteName: string) {
    if (!cedenteName) return null

    const supabase = createAdminClient()

    // Search for EXACT match first
    const { data, error } = await supabase
        .from('registros')
        .select('gestor')
        .ilike('produto', cedenteName.trim())
        .not('gestor', 'is', null)
        .neq('gestor', '')

    if (error || !data || data.length === 0) return null

    // Count frequencies
    const freq: Record<string, number> = {}
    data.forEach(r => {
        const g = r.gestor
        freq[g] = (freq[g] || 0) + 1
    })

    // Find max
    let bestGestor = null
    let maxCount = 0
    Object.keys(freq).forEach(g => {
        if (freq[g] > maxCount) {
            maxCount = freq[g]
            bestGestor = g
        }
    })

    return bestGestor
}
