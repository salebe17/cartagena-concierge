import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const correlationId = crypto.randomUUID();
    const headersWidthId = new Headers(request.headers);
    headersWidthId.set('x-correlation-id', correlationId);

    let response = NextResponse.next({
        request: {
            headers: headersWidthId,
        },
    })

    // Also set it on response so client can see it
    response.headers.set('x-correlation-id', correlationId);

    // Headers are now handled in next.config.js (Level 32)
    // We only handle Logic/Auth here.

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 0. Maintenance Mode Check
    // Runs on ALL routes except /admin, /auth, /api/auth
    if (!request.nextUrl.pathname.startsWith('/admin') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/api/auth')) {

        try {
            const { data: settings } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'maintenance_mode')
                .single();

            const maintenance = settings?.value;
            // Allow ONLY admin role to bypass
            if (maintenance?.enabled) {
                let isAdmin = false;
                if (user) {
                    // Check profile role
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                    if (profile?.role === 'admin') isAdmin = true;
                }

                if (!isAdmin) {
                    return new NextResponse(
                        `<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f9fafb;color:#111;">
                            <div style="text-align:center">
                                <h1 style="font-size:3rem;margin-bottom:1rem;">🚧</h1>
                                <h2>${maintenance.message || 'Mantenimiento en Progreso'}</h2>
                                <p>Estamos mejorando la plataforma. Volvemos en breve.</p>
                            </div>
                        </body></html>`,
                        { status: 503, headers: { 'content-type': 'text/html' } }
                    );
                }
            }
        } catch (e) {
            // Failsafe: If DB down, assume NO maintenance to avoid lockout
            // console.error("Middleware Maintenance Check Failed", e);
        }
    }

    // 1. Protect Admin Routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 2. Protect Host Routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder (if accessible directly)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
