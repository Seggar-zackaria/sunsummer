"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
  session?: any;
}

/**
 * AuthProvider component that wraps the application with SessionProvider
 * This ensures consistent authentication state across the application
 */
export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gets focus
    >
      {children}
    </SessionProvider>
  );
} 