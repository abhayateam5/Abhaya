import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/register', '/forgot-password', '/reset-password', '/'];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // If not authenticated and trying to access protected route
    if (!session && !isPublicRoute) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (session && (pathname === '/login' || pathname === '/signup' || pathname === '/register')) {
        const redirectUrl = req.nextUrl.clone();

        // Check profile completion
        try {
            const profileRes = await fetch(`${req.nextUrl.origin}/api/profile/complete`, {
                headers: {
                    Cookie: req.headers.get('cookie') || '',
                },
            });

            const profileData = await profileRes.json();

            if (!profileData.complete) {
                redirectUrl.pathname = '/onboarding';
            } else {
                // Get user role
                const userRes = await fetch(`${req.nextUrl.origin}/api/profile`, {
                    headers: {
                        Cookie: req.headers.get('cookie') || '',
                    },
                });

                const userData = await userRes.json();

                if (userData.data?.role === 'police') {
                    redirectUrl.pathname = '/police/dashboard';
                } else {
                    redirectUrl.pathname = '/tourist/dashboard';
                }
            }

            return NextResponse.redirect(redirectUrl);
        } catch (error) {
            // If error checking profile, just redirect to dashboard
            redirectUrl.pathname = '/tourist/dashboard';
            return NextResponse.redirect(redirectUrl);
        }
    }

    // If authenticated but profile incomplete, redirect to onboarding
    if (session && !isPublicRoute && pathname !== '/onboarding') {
        try {
            const profileRes = await fetch(`${req.nextUrl.origin}/api/profile/complete`, {
                headers: {
                    Cookie: req.headers.get('cookie') || '',
                },
            });

            const profileData = await profileRes.json();

            if (!profileData.complete) {
                const redirectUrl = req.nextUrl.clone();
                redirectUrl.pathname = '/onboarding';
                return NextResponse.redirect(redirectUrl);
            }
        } catch (error) {
            // If error, allow access
            console.error('Error checking profile completion:', error);
        }
    }

    return res;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (handled separately)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
