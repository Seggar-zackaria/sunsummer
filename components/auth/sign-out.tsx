"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export const SignOutButton = () => {
  return (
    <Button 
      size="lg" 
      variant="outline"
      className="w-full"
      onClick={() => signOut()}
      >
      <LogOut />
      Log Out
    </Button>
  );
};
