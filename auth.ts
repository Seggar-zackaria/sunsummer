import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { getUserById } from "./data/user";
import { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      } 
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    }
  },
  
  debug: process.env.NODE_ENV === "development",
  ...authConfig,
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // allow oAuth without email verification
      if (account?.provider !== "credentials") return true;
      if (!user.id) return false;
      
      try {
        const existingUser = await getUserById(user.id);
        // Prevent sign in if user doesn't exist or email isn't verified
        if (!existingUser?.emailVerified) {
          return false;
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith(DEFAULT_LOGIN_REDIRECT);
      const isOnAuthPage = nextUrl.pathname.startsWith("/auth");

      // If user is on auth page and is logged in, redirect to dashboard
      if (isOnAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return true;
      }

      // If user is trying to access dashboard but not logged in
      if (isOnDashboard) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/auth/login", nextUrl));
        }
        return true;
      }

      return true;
    },
    
    async session({ session, token }) {
      console.log("Session callback called with token:", token);
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole || "USER"; // Provide default role
        
        // Ensure other user properties are set
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }
      
      console.log("Returning session:", session);
      return session;
    },
    async jwt({ token, user }) {
      console.log("JWT callback called with token:", token);
      
      // If user is provided, this is a sign-in event, update the token with user data
      if (user) {
        console.log("JWT callback: user object found, updating token");
        // Handle user.role - cast from database object if available
        // For Prisma adapter, role can come from the DB model
        const userWithRole = user as any; // Cast to any to access potential role property
        token.role = userWithRole.role || "USER";
        return token;
      }
      
      // For subsequent requests, only query the database if we're not in edge runtime
      if (!token.sub) return token;

      try {
        // For middleware support, skip database access in edge runtime
        if (process.env.NEXT_RUNTIME === "edge") {
          console.log("JWT callback: running in edge runtime, skipping DB access");
          return token;
        }

        const existingUser = await getUserById(token.sub);
        console.log("User from database:", existingUser);

        if (!existingUser) return token;

        // Update token with user data
        token.role = existingUser.role as UserRole;
        token.name = existingUser.name || undefined;
        token.email = existingUser.email || undefined;
        token.picture = existingUser.image || undefined;
      } catch (error) {
        console.error("Error in JWT callback:", error);
        // Keep token intact if there's a database error
      }
      
      console.log("Returning updated token:", token);
      return token;
    },
  },
});