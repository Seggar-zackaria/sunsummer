import NextAuth, { Session } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { getUserById } from "./data/user";
import { UserRole } from "@prisma/client";
import { JWT } from "next-auth/jwt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24
      }
    }
  },
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
      console.log("[signIn Callback] User:", user);
      console.log("[signIn Callback] Account:", account);
      if (account?.provider !== "credentials") return true;
      if (!user.id) {
        console.log("[signIn Callback] Denied: No user ID found.");
        return false;
      }
      const existingUser = await getUserById(user.id);
      console.log("[signIn Callback] Fetched existingUser:", existingUser);
      if (!existingUser?.emailVerified) {
        console.log("[signIn Callback] Denied: Email not verified or user not found.");
        return false;
      }
      console.log("[signIn Callback] Allowed.");
      return true;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith(DEFAULT_LOGIN_REDIRECT);
      const isOnAuthPage = nextUrl.pathname.startsWith("/auth");

      if (isOnAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return true;
      }

      if (isOnDashboard) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/auth/login", nextUrl));
        }
        return true;
      }
      return true;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("[session Callback] Received token:", token);
      console.log("[session Callback] Initial session:", session);

      if (token && session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as UserRole;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
        session.user.image = token.image as string | null ?? null;
      } else {
        console.error("[session Callback] Token or session.user is undefined!");
      }

      console.log("[session Callback] Final session:", session);
      return session;
    },

    async jwt({ token, user }) {
      console.log("[jwt Callback] Initial token:", token);
      console.log("[jwt Callback] User:", user);

      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }

      if (!token.sub) {
        console.log("[jwt Callback] No sub found in token, returning.");
        return token;
      }

      try {
        const existingUser = await getUserById(token.sub);
        console.log("[jwt Callback] Fetched existingUser:", existingUser);

        if (!existingUser) {
          console.log("[jwt Callback] User not found in DB, returning token.");
          return token;
        }

        token.name = existingUser.name;
        token.email = existingUser.email;
        token.image = existingUser.image;
        token.role = existingUser.role;

        console.log("[jwt Callback] Returning enriched token:", token);
        return token;
      } catch (error) {
        console.error("[jwt Callback] Error fetching user:", error);
        return token;
      }
    },
  },
});