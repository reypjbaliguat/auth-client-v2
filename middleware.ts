import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Not logged in → redirect to /login
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// Protect specific routes
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/profile/:path*"],
};
