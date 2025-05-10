"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { SessionDebug } from "@/components/session-debug";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-40">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {user ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              {user.image && (
                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                  <Image 
                    src={user.image}
                    alt={user.name || "User avatar"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-2 text-center sm:text-left">
                <div>
                  <span className="font-medium text-gray-500">Name:</span> 
                  <span className="ml-2">{user.name || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Email:</span> 
                  <span className="ml-2">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Role:</span> 
                  <span className="ml-2">{user.role}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">User ID:</span> 
                  <span className="ml-2">{user.id}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <p className="text-yellow-700">
            Not logged in or session not available.
          </p>
        </div>
      )}
      <SessionDebug />
    </div>
  );
}