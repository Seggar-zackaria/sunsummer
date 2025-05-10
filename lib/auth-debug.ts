/**
 * Auth debugging utilities
 */

import { cookies } from "next/headers";

/**
 * Utility to debug session cookies server-side
 * Call this function in server components to log cookie information
 */
export async function debugSessionCookies() {
  if (process.env.NODE_ENV !== "development") {
    return; // Only run in development
  }
  
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    console.log("==== Auth Cookie Debug ====");
    console.log("All cookies:", allCookies.map((c) => c.name));
    
    // Look for session cookies
    const sessionCookie = cookieStore.get("next-auth.session-token");
    
    if (sessionCookie) {
      console.log("Session cookie found:", {
        name: sessionCookie.name,
        value: `${sessionCookie.value.substring(0, 8)}...`,
        path: sessionCookie.path,
        expires: sessionCookie.expires,
      });
    } else {
      console.log("No session cookie found");
    }
    
    // Check for CSRF token
    const csrfCookie = cookieStore.get("next-auth.csrf-token");
    if (csrfCookie) {
      console.log("CSRF cookie found");
    } else {
      console.log("No CSRF cookie found");
    }
    
    console.log("==== End Auth Cookie Debug ====");
  } catch (error) {
    console.error("Error debugging cookies:", error);
  }
} 