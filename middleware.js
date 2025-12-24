import { NextResponse } from 'next/server'

export function middleware(request) {
    return NextResponse.next()
}

export const config = {
    matcher: ['/verificacao-middleware-teste'], // Valid route to pass build validation
}
