"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function SessionDebug() {
  const { data: sessionData, status, update } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // Force client-side rendering only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to manually refresh the session
  const refreshSession = async () => {
    await update();
    setLastUpdated(new Date().toISOString());
  };

  if (!isClient) {
    return <div>Loading session data...</div>;
  }

  return (
    <div className="p-4 m-4 bg-gray-100 rounded-lg text-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-bold mb-2">Session Debug</h3>
        <button 
          onClick={refreshSession}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Refresh Session
        </button>
      </div>
      <p>Session Status: <span className="font-mono">{status}</span></p>
      <p>Last Updated: <span className="font-mono">{lastUpdated}</span></p>
      
      {status === "authenticated" ? (
        <div>
          <p>User ID: <span className="font-mono">{sessionData?.user?.id || "Not available"}</span></p>
          <p>User Name: <span className="font-mono">{sessionData?.user?.name || "Not available"}</span></p>
          <p>User Email: <span className="font-mono">{sessionData?.user?.email || "Not available"}</span></p>
          <p>User Role: <span className="font-mono">{sessionData?.user?.role || "Not available"}</span></p>
          <p>User Image: {sessionData?.user?.image ? 
            <span className="font-mono">Available</span> : 
            <span className="font-mono">Not available</span>}
          </p>
          
          <div className="mt-4">
            <p className="font-bold">Full Session Data:</p>
            <pre className="mt-2 p-2 bg-gray-200 rounded overflow-auto max-h-40 text-xs">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <p className="font-bold">Session Cookie Info:</p>
            <div className="mt-2 p-2 bg-gray-200 rounded text-xs">
              Check your browser's cookies for <code>next-auth.session-token</code>
            </div>
          </div>
        </div>
      ) : status === "loading" ? (
        <p>Loading session...</p>
      ) : (
        <div>
          <p className="text-red-500">Not authenticated</p>
          <p className="text-sm mt-2">
            If you believe you should be logged in, try these steps:
          </p>
          <ul className="list-disc pl-5 text-xs mt-1">
            <li>Clear your browser cookies</li>
            <li>Try logging in again</li>
            <li>Check for any console errors</li>
          </ul>
        </div>
      )}
    </div>
  );
} 