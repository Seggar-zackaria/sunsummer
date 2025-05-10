import type { Metadata } from "next";
import type React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";

// Add metadata
export const metadata: Metadata = {
  title: "Dashboard | Sun Summer",
  description: "Manage your bookings and account",
};

// Server component with session-based protection
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The auth() function works in server components (not middleware)
  const session = await auth();

  // Debug session in server component
  console.log("Dashboard Layout - Session Check:", !!session?.user);
  
  if (!session?.user) {
    console.log("No user in session, redirecting to login");
    return redirect("/auth/login");
  }

  // Log user info when available
  console.log("User in session:", {
    id: session.user.id,
    role: session.user.role,
    name: session.user.name
  });

  return (
    <DashboardClient user={session.user}>
      {children}
    </DashboardClient>
  );
}
