"use client"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react";
import { UserRole } from "@prisma/client";

let latestAvatarUrl: string | null = null;

// Define a type for the user data to ensure consistency
type UserData = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image: string | null;
  role: UserRole;
  refreshUserData: () => void;
  updateAvatar: (newImageUrl: string | null) => void;
  isLoading: boolean;
};

export const useUser = (): UserData => {
    // Force client-side to ensure we're using client-side session
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);

    const { data: sessionData, status, update } = useSession();
    const userSession = sessionData?.user;
    
    const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
    
    // Initialize local image URL from session when session loads
    useEffect(() => {
        if (userSession?.image) {
            setLocalImageUrl(userSession.image);
            latestAvatarUrl = userSession.image;
        }
    }, [userSession?.image]);

    // Debug session data
    useEffect(() => {
        if (mounted) {
            console.log("Session status in useUser:", status);
            console.log("Session data in useUser:", sessionData);
            console.log("User session in useUser:", userSession);
        }
    }, [mounted, status, sessionData, userSession]);

    // Function to refresh only the session data when needed
    const refreshUserData = useCallback(() => {
        console.log("Refreshing user data");
        update();
    }, [update]);

    //  update just the avatar image without a full session refresh
    const updateAvatar = useCallback((newImageUrl: string | null) => {
        console.log("Updating avatar to:", newImageUrl);
        setLocalImageUrl(newImageUrl);
        latestAvatarUrl = newImageUrl;
    }, []);

    // Return user session with image override, ensure we don't lose type safety
    if (!mounted) {
        return {
            id: undefined,
            name: null,
            email: null,
            role: "USER" as UserRole,
            image: null,
            refreshUserData,
            updateAvatar,
            isLoading: true,
        };
    }

    if (userSession) {
        console.log("Returning user session with data");
        return {
            ...userSession,
            image: localImageUrl ?? (userSession.image ?? null),
            refreshUserData,
            updateAvatar,
            isLoading: status === "loading",
        };
    } else {
        console.log("Returning default user data (no session)");
        return {
            id: undefined,
            name: null,
            email: null,
            role: "USER" as UserRole, // Default role when not authenticated
            image: null,
            refreshUserData,
            updateAvatar,
            isLoading: status === "loading",
        };
    }
}

