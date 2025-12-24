import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // SECURITY: Add critical cookie flags
                            cookieStore.set(name, value, {
                                ...options,
                                httpOnly: true,  // ✅ Prevents JavaScript access (XSS protection)
                                secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only in production
                                sameSite: 'lax', // ✅ CSRF protection
                                path: '/',       // ✅ Available across entire site
                            })
                        })
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
