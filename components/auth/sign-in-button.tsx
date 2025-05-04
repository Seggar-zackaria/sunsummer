"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";


const SignInButton= () => {
  const router = useRouter();
  const OnClick = () => {
    router.push("/auth/login");
  };

  const { data: session } = useSession();

  if (session) {
    return (
      <Button onClick={OnClick} variant="ghost" className="text-white">
        Dashboard
      </Button>
    );
  }

  return (
    <Button onClick={OnClick} variant="ghost" className="text-white">
      Sign in
    </Button> 
  );
};

export default SignInButton;
