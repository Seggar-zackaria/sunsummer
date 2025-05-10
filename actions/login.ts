"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/app/api/send/route";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

interface LoginProps {
  values: z.infer<typeof LoginSchema>;
  formData: FormData;
}
interface LoginResponse {
  success?: string;
  error?: string;
}
export async function Login({
  values,
  formData,
}: LoginProps): Promise<LoginResponse> {
  const validateFields = LoginSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Invalid fields" };
  }
  
  const { email, password } = validateFields.data;
  
  try {
    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
      return { error: "Email does not exist" };
    }

    if(!existingUser.emailVerified){
      const verificationToken = await generateToken(existingUser.email);

      await sendVerificationEmail(verificationToken.identifier, verificationToken.token);
      return { success: "Confirmation email sent" }
    }

    // Use callbackUrl to redirect after successful login
    const callbackUrl = formData.get("callbackUrl")?.toString() || DEFAULT_LOGIN_REDIRECT;
    
    try {
      // Note: We're not actually using this signIn here anymore
      // The client-side signIn handles the actual authentication
      // This is just for verification checks
      return { success: "Verification passed" };
    } catch (error) {
      console.error("Login error:", error);
      
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return { error: "Invalid credentials" };
          default:
            return { error: `Authentication error: ${error.type}` };
        }
      }
      
      return { error: "Something went wrong during login" };
    }
  } catch (error) {
    console.error("Unexpected error in login action:", error);
    return { error: "An unexpected error occurred" };
  }
}
