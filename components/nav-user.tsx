"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  Sparkles,
  User
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SignOutButton } from "./auth/sign-out";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export function NavUser() {
  const { isMobile } = useSidebar();
  const user = useUser();
  const session = useSession();
  const [nameFallback, setNameFallback] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  
  // Add debugging
  useEffect(() => {
    console.log("Session status:", session.status);
    console.log("Session data:", session.data);
    console.log("User from useUser:", user);
  }, [session, user]);
  
  // Update the fallback name whenever user data changes
  useEffect(() => {
    if (user?.name) {
      setNameFallback(user.name.charAt(0).toUpperCase());
    }
  }, [user?.name]);

  // Reset image error state when image URL changes
  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  // Process the image URL to ensure it's valid
  const processImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return "";
    
    // If it's a full URL (starts with http), use it directly
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path, ensure it starts with /
    if (!imageUrl.startsWith('/')) {
      return `/${imageUrl}`;
    }
    
    return imageUrl;
  };

  const imageUrl = processImageUrl(user?.image);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {!imageError && imageUrl ? (
                  <AvatarImage 
                    src={imageUrl} 
                    alt={user?.name || ""}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <AvatarFallback className="rounded-lg">{nameFallback}</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {!imageError && imageUrl ? (
                    <AvatarImage 
                      src={imageUrl} 
                      alt={user?.name || ""}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <AvatarFallback className="rounded-lg">{nameFallback}</AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                My Bookings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignOutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}