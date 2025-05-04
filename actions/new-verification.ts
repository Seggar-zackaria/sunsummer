"use server";

import { db } from "@/lib/db";
import {getUserByEmail} from "@/data/user";
import {getVerificationToken} from "@/data/verification-token";

export async function verifyEmail(token: string) {
  const verificationToken = await getVerificationToken(token);
  if (!verificationToken) {
    throw new Error("Invalid verification token");
  }

  const hasExpired = new Date(verificationToken.expires) < new Date();
  if (hasExpired) {
    throw new Error("Verification token has expired");
  }

  const user = await getUserByEmail(verificationToken.identifier);
  if (!user) {
    throw new Error("User not found");
  }

  await db.user.update({
    where: { id: user.id },
    data: { 
        emailVerified: new Date(),
        email: verificationToken.identifier,
     },
  });
 // remove the old verification token in the data base
  await db.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return { success: 'Email verified successfully' };
}