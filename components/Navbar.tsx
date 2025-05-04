"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="w-full py-4 bg-transparent absolute z-20">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link 
            href="/" 
            className="flex items-center"
            aria-label="Go to homepage"
          >
            <span className="text-white font-bold text-2xl">Sun Summer</span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Button 
              variant="ghost" 
              className="text-white px-0 hover:bg-transparent hover:text-white/80"
              asChild
            >
              <Link 
                href="/find-flights"
                className="flex items-center gap-2"
                aria-label="Find flights"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                  </svg>
                </span>
                Find Flights
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-white px-0 hover:bg-transparent hover:text-white/80"
              asChild
            >
              <Link 
                href="/find-hotels" 
                className="flex items-center gap-2"
                aria-label="Find hotels"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 7v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7"/>
                    <rect x="8" y="2" width="8" height="5" rx="1"/>
                    <path d="M8 10h8"/>
                    <path d="M8 14h8"/>
                  </svg>
                </span>
                Find Hotels
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {status === "authenticated" && session ? (
            <>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-transparent hover:text-white/80"
                asChild
              >
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2"
                  aria-label="Go to your dashboard"
                >
                  <User size={18} />
                  Dashboard
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="text-white bg-transparent border-white hover:bg-white hover:text-black"
                onClick={handleSignOut}
                aria-label="Sign out of your account"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-transparent hover:text-white/80"
                asChild
              >
                <Link 
                  href="/auth/login"
                  aria-label="Login to your account"
                >
                  Login
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="text-white bg-transparent border-white hover:bg-white hover:text-black"
                asChild
              >
                <Link 
                  href="/auth/register"
                  aria-label="Sign up for an account"
                >
                  Sign up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-black/50 to-transparent -z-10"></div>
    </nav>
  );
};

export default Navbar; 