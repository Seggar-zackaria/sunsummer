"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/app/api/send/route";

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
  const existingUser = await getUserByEmail(validateFields.data.email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist" };
  }

  if(!existingUser.emailVerified){
    const verificationToken = await generateToken(existingUser.email);

    await sendVerificationEmail(verificationToken.identifier, verificationToken.token);
    return { success: "Confirmation email sent" }
  }

  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
    });
    return !validateFields
      ? { error: "incorrect credentials!" }
      : { success: "Login successful!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}
