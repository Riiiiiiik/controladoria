// import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // console.log("Middleware: Invoked for path:", request.nextUrl.pathname);

    // TEMPORARY: Pass-through everything to isolate crash
    return NextResponse.next();

    /*
    try {
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        // Create client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        console.log("Middleware: Checking Env Vars");
        if (!supabaseUrl || !supabaseKey) {
            console.error("Middleware: Missing Env Vars");
            return new NextResponse(
                JSON.stringify({
                    error: 'Configuration Error',
                    message: 'Missing Supabase Environment Variables!',
                    details: {
                        hasUrl: !!supabaseUrl,
                        hasKey: !!supabaseKey
                    }
                }),
                { status: 500, headers: { 'content-type': 'application/json' } }
            )
        }

        console.log("Middleware: Initializing Supabase Client");
        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value }) => {
                                request.cookies.set(name, value)
                            })
                            response = NextResponse.next({
                                request,
                            })
                            cookiesToSet.forEach(({ name, value, options }) => {
                                response.cookies.set(name, value, options)
                            })
                        } catch (cookieError) {
                            console.error("Middleware: Cookie Set Error", cookieError);
                        }
                    },
                },
            }
        )

        console.log("Middleware: Getting User");
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        // Log error if useful, but proceed
        if (userError) {
            console.log("Middleware Auth Check Error (might be just no session):", userError.message)
        } else {
             console.log("Middleware: User found:", !!user);
        }

        // Protected routes logic
        if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
            console.log("Middleware: Redirecting to Login");
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/')) {
             console.log("Middleware: Redirecting to Dashboard");
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        console.log("Middleware: Proceeding");
        return response
    } catch (e: any) {
        console.error("Middleware: CRITICAL CATCH", e);
        return new NextResponse(
            JSON.stringify({
                error: 'Middleware Exception',
                message: e.message || 'Unknown error',
                stack: e.stack
            }),
            { status: 500, headers: { 'content-type': 'application/json' } }
        )
    }
    */
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
