import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiting (for API routes only)
// For production at scale, use Redis/Upstash
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

export function middleware(request: NextRequest) {
    // Only apply rate limiting to API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const now = Date.now()
        const limit = rateLimit.get(ip)

        const maxRequests = 20 // requests
        const windowMs = 60000 // per minute

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
                // Reset window
                rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
            }
        } else {
            // First request from this IP
            rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}
