import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
    // SECURITY: Verify authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete ONLY the current user's registros (RLS will also enforce this)
    const { error, count } = await supabase
        .from('registros')
        .delete({ count: 'exact' })
        .eq('user_id', user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        message: `${count} registros deletados com sucesso`,
        count
    })
}
