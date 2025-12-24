import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Simple in-memory rate limiting (for API routes only)
const rateLimit = new Map<string, { count: number, resetTime: number }>()

// Clean up old entries every 10 minutes
setInterval(() => {
    const now = Date.now()
    for (const [ip, data] of rateLimit.entries()) {
        if (now > data.resetTime) {
            rateLimit.delete(ip)
        }
    }
}, 600000)

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // SECURITY: Supabase session refresh with secure cookie flags
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        // CRITICAL: Set secure cookie flags HERE in middleware
                        response.cookies.set(name, value, {
                            ...options,
                            httpOnly: true,  // ✅ XSS protection
                            secure: true,    // ✅ HTTPS only (works on localhost too!)
                            sameSite: 'lax', // ✅ CSRF protection
                            path: '/',
                        })
                    })
                },
            },
        }
    )

    // Refresh session
    await supabase.auth.getUser()

    // Apply rate limiting to API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const now = Date.now()
        const limit = rateLimit.get(ip)

        const maxRequests = 20
        const windowMs = 60000

        if (limit) {
            if (now < limit.resetTime) {
                if (limit.count >= maxRequests) {
                    return NextResponse.json(
                        { error: 'Too many requests. Please try again later.' },
                        {
                            status: 429,
                            headers: {
                                'Retry-After': String(Math.ceil((limit.resetTime - now) / 1000))
                            }
                        }
                    )
                }
                limit.count++
            } else {
                rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
            }
        } else {
            rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
