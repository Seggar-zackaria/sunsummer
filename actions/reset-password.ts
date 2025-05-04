"use server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ResetPasswordSchema } from "@/schemas";
import * as z from "zod";
import { createPasswordResetByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";

type ResetPasswordResponse = {
  error?: string;
  success?: string;
};

export const resetPassword = async (
  values: z.infer<typeof ResetPasswordSchema>,
  token: string | null
): Promise<ResetPasswordResponse> => {
  try {
    if (!token) {
      return { error: "Token is missing" };
    }

    const validatedFields = ResetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid password format" };
    }

    const { password } = validatedFields.data;

    const existingToken = await createPasswordResetByToken(token);

    if (!existingToken) {
      return { error: "Invalid or expired token" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      // Clean up expired token
      await db.passwordResetToken.delete({
        where: { id: existingToken.id },
      });
      return { error: "Token has expired" };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
      return { error: "User not found" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // transaction to ensure both operations complete or none
    await db.$transaction([
      db.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.delete({
        where: { id: existingToken.id },
      }),
    ]);

    return { success: "Password reset successfully" };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "An error occurred while resetting password" };
  }
};
