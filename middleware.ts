import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/auth'

export default NextAuth(authConfig).auth;

const protectedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/bookings/manage': ['admin'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()

  const userRole = session?.user?.role

  if (userRole) {
    request.cookies.set('user_role', userRole.toString())
  }
  const userRole2 = request.cookies.get('user_role')?.value
  
  const requiredRoles = Object.entries(protectedRoutes).find(([route]) => 
    pathname.startsWith(route)
  )?.[1]

  if (requiredRoles) {
    if (!userRole2) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const hasAccess = requiredRoles.includes(userRole2)

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  const response = NextResponse.next()
  response.headers.set('Cache-Control', 's-maxage=60')
  
  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/bookings/manage/:path*',
  ],
  runtime: 'nodejs'
};
