import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

// Define protected routes and required roles
const protectedRoutes: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/bookings/manage': ['ADMIN'],
  '/dashboard': ['USER', 'ADMIN'] // Allow both USER and ADMIN roles
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for protected routes
  const route = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );
  
  // Only apply auth check to protected routes
  if (route) {
    console.log("Protected route detected:", pathname);
    
    // Get the token using getToken with debug enabled
    const token = await getToken({ 
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
      cookieName: "next-auth.session-token",
    });
    
    console.log("Token found in middleware:", !!token);
    
    // If no token or session found, redirect to login
    if (!token) {
      console.log("No token found, redirecting to login");
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check role-based access if token exists
    const userRole = token.role as string;
    const requiredRoles = protectedRoutes[route];
    
    console.log("User role:", userRole, "Required roles:", requiredRoles);
    
    // Make sure user has a role and it's included in the required roles
    if (!userRole || !requiredRoles.includes(userRole)) {
      console.log("User does not have required role, redirecting to unauthorized");
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    console.log("Access granted to protected route");
  }
  
  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/bookings/manage/:path*',
    '/dashboard/:path*'
  ]
};
