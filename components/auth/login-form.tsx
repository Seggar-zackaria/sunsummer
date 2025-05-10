"use client";

import CardWrapper from "@/components/auth/card-wrapper";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas/index";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-succes";
import { Login } from "@/actions/login";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

const LoginForm = () => {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || DEFAULT_LOGIN_REDIRECT;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Debug session status for troubleshooting
  useEffect(() => {
    console.log("Current session status:", status);
    console.log("Current session:", session);
  }, [status, session]);
  
  // Redirect when authentication status changes to authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user && !isRedirecting) {
      console.log("Session authenticated, redirecting to:", callbackUrl);
      console.log("Session data:", session);
      setIsRedirecting(true);
      
      // Add a small delay to ensure cookies are set properly
      setTimeout(() => {
        router.push(callbackUrl);
      }, 300);
    }
  }, [status, router, callbackUrl, session, isRedirecting]);

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    if (isPending) return;
    
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // First try server action for email verification check
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("callbackUrl", callbackUrl);
      
      const actionResponse = await Login({ values, formData });
      
      if (actionResponse.error) {
        setErrorMessage(actionResponse.error);
        setIsPending(false);
        return;
      }
      
      if (actionResponse.success === "Confirmation email sent") {
        setSuccessMessage(actionResponse.success);
        setIsPending(false);
        return;
      }
      
      // If no errors and not waiting for email verification, proceed with client-side sign-in
      console.log("Attempting sign in with credentials...");
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: callbackUrl
      });
      
      console.log("Sign in result:", result);
      
      if (result?.error) {
        setErrorMessage(result.error);
        setIsPending(false);
        return;
      }
      
      // Force a session update to ensure we have the latest data
      await update();
      
      // If we get here with no errors, show success message briefly
      setSuccessMessage("Login successful! Redirecting...");
      
      // The redirection will happen via the useEffect when status changes
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Something went wrong. Please try again.");
      setIsPending(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 
  return (
    <div className="w-full max-w-md">
      <CardWrapper
        headerLabel="Login"
        backButtonLabel="Don't have an account?"
        backButtonHref="/auth/register"
        showSocial
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Enter your email"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <Button variant="link" size="sm" asChild className="p-0">
                      <Link href="/auth/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">Forgot Password</Link>
                    </Button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage && <FormError message={errorMessage} />}
            {successMessage && <FormSuccess message={successMessage} />}

            <Button
              variant="default"
              disabled={isPending || status === "loading"}
              type="submit"
              className="w-full h-12 mt-6 bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? "Signing in..." : "Login"}
            </Button>
            
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};

export default LoginForm;
