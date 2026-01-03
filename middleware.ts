import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	const token = request.cookies.get('token')?.value;
	const { pathname } = request.nextUrl;

	// Define protected and auth routes
	const protectedRoutes = ['/dashboard', '/settings', '/profile'];
	const authRoutes = ['/sign-in', '/sign-up'];

	// Check if current path is protected or auth route
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
	const isAuthRoute = authRoutes.includes(pathname);

	// If accessing protected route without token, redirect to sign-in
	if (isProtectedRoute && !token) {
		return NextResponse.redirect(new URL('/sign-in', request.url));
	}

	// If logged in and accessing auth routes, redirect to dashboard
	if (token && isAuthRoute) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/settings/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};
