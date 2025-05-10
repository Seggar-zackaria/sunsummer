"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionDebug } from "@/components/session-debug";
import { signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthTestPage() {
  const { data: session, status, update } = useSession();
  const [isManualRedirecting, setIsManualRedirecting] = useState(false);
  const router = useRouter();
  const [cookies, setCookies] = useState<string[]>([]);
  
  // Get cookies on client side
  useEffect(() => {
    setCookies(document.cookie.split(';').map(c => c.trim()));
  }, []);
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    update();
  };
  
  const handleDirectSignIn = async () => {
    await signIn("credentials", {
      email: "zakari0002@gmail.com", // Replace with test email
      password: "Password123!", // Replace with test password
      redirect: false
    });
    update();
  };
  
  const goToDashboard = () => {
    setIsManualRedirecting(true);
    router.push("/dashboard");
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Session Status</h2>
        <p className="mb-2">
          Current status: <span className="font-mono">{status}</span>
        </p>
        
        {status === "authenticated" && (
          <div className="mb-4">
            <p>Authenticated as: <span className="font-mono">{session?.user?.name || session?.user?.email}</span></p>
            <p>Role: <span className="font-mono">{session?.user?.role || "Not available"}</span></p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            onClick={() => update()}
            variant="outline"
          >
            Refresh Session
          </Button>
          
          {status === "authenticated" ? (
            <Button 
              onClick={handleSignOut}
              variant="destructive"
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Button 
                asChild
                variant="default"
              >
                <Link href="/auth/login">Sign In Form</Link>
              </Button>
              
              <Button 
                onClick={handleDirectSignIn}
                variant="default"
              >
                Direct Sign In
              </Button>
            </>
          )}
        </div>
      </div>
      
      {status === "authenticated" && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Navigation Test</h2>
          <p className="text-green-700 mb-4">
            You're authenticated. Try navigating to the dashboard with these different methods:
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              asChild
              variant="outline"
              className="bg-white"
            >
              <Link href="/dashboard">Link to Dashboard</Link>
            </Button>
            
            <Button 
              onClick={goToDashboard}
              disabled={isManualRedirecting}
              variant="default"
            >
              {isManualRedirecting ? "Redirecting..." : "Programmatic Navigation"}
            </Button>
          </div>
          
          {isManualRedirecting && (
            <p className="mt-2 text-sm text-green-600">
              Redirecting to dashboard...
            </p>
          )}
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Current Cookies</h2>
        <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
          <ul className="space-y-1">
            {cookies.map((cookie, i) => (
              <li key={i}>{cookie}</li>
            ))}
          </ul>
          {cookies.length === 0 && <p>No cookies found</p>}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Session Debug Information</h2>
        <SessionDebug />
      </div>
    </div>
  );
} 