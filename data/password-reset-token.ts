"use server";
import {db} from "@/lib/db";
import { PasswordResetToken } from "@prisma/client";
import crypto from "crypto";

const createPasswordResetByToken = async (token: string): Promise<PasswordResetToken | null> => {
  if (!token) {
    throw new Error("Token is required");
  }
  try {
    const passwordResetToken = await db.passwordResetToken.findUnique({
        where: {
          token,
        },
      });
      return passwordResetToken;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create password reset token");
  }
}

const createPasswordResetByEmail = async (email: string): Promise<void> => {
  try {
    const passwordResetToken = await db.passwordResetToken.findFirst({
      where: {
        email,
      },
    });

    if (!passwordResetToken) {
      return;
    }

    return;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create password reset token");
  }
}

const getPasswordResetByToken = async (token: string): Promise<PasswordResetToken | null> => {
  if (!token) {
    throw new Error("Token is required");
  }

  try {
    const passwordResetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });
    return passwordResetToken;
  } catch (error) {
    console.error("Error in getPasswordResetByToken:", error);
    throw new Error("Failed to find password reset token");
  }
}

const createPasswordResetToken = async (email: string): Promise<PasswordResetToken> => {
  try {
    // Generate a random token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600 * 1000); // Token expires in 1 hour

    const passwordResetToken = await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return passwordResetToken;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create password reset token");
  }
}

export {
  createPasswordResetByToken,
  createPasswordResetByEmail,
  getPasswordResetByToken,
  createPasswordResetToken,
};