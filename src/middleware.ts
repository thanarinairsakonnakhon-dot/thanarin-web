import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Note: We need to create a response first to pass to createMiddlewareClient
    // because it needs to set cookies on the response
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // 1. Protect Admin Routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
        // Allow access to login page
        if (req.nextUrl.pathname === '/admin/login') {
            // If already logged in, redirect to dashboard (bookings)
            if (session) {
                return NextResponse.redirect(new URL('/admin/bookings', req.url));
            }
            return res;
        }

        // specific check for login api to avoid loop if needed, but middleware usually runs before api routes in some configs
        // easier to just check session for other admin pages

        if (!session) {
            // If not logged in, redirect to login
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    return res;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/admin/:path*',
    ],
};
