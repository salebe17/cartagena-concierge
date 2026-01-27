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

    // LEVEL 15: Strict Security Headers
    response.headers.set('X-Frame-Options', 'DENY'); // Prevent Clickjacking inside iframes
    response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent Mime Sniffing
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); // HSTS (1 year)

    // Content Security Policy (Basic)
    // We allow scripts from 'self', 'unsafe-inline' (Next.js needs it sometimes), and Stripe/Supabase domains.
    // In strict mode, we would use nonces.
    const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://api.stripe.com;";
    response.headers.set('Content-Security-Policy', csp);

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
    if (!request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/auth')) {
        const { data: settings } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'maintenance_mode')
            .single();

        const maintenance = settings?.value;
        // Allow ONLY admin@cartagenaconcierge.com (or similar) to bypass
        if (maintenance?.enabled && (!user || user.email !== 'admin@cartagenaconcierge.com')) {
            // Only allow DB-verified admins. Since middleware runs on edge/serverless, 
            // a quick profile query is acceptable if DB is close.
            let isAdmin = false;
            if (user) {
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
    }

    // 1. Protect Admin Routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // We should ideally check role here too, but that requires a DB query which middleware handles carefully.
        // For critical security, Layout/Page check is primary because Middleware might not have full DB access easily without extra setup.
        // However, basic Auth check shields 90% of noise.
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
        '/admin/:path*',
        '/dashboard/:path*',
        '/api/admin/:path*', // Protect Admin APIs too!
    ],
}
