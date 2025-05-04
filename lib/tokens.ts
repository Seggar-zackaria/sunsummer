import { getVerificationTokenByEmail } from "@/data/verification-token";
import { randomBytes } from "crypto";
import { db } from "./db";
import { createPasswordResetByToken } from "@/data/password-reset-token";

// generate a random token
const token = randomBytes(32).toString("hex");
// 1000ms * 60s * 60min = 1 hour in milliseconds
const expires = new Date(Date.now() + 1000 * 60 * 60);


export const generatePasswordResetToken = async (email: string) => {
  const existingToken = await createPasswordResetByToken(email);

  if (existingToken) {
    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  }
  
  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
}

export const generateToken = async (identifier: string) => {
 
  const existingToken = await getVerificationTokenByEmail(identifier);
  if (existingToken) {
    await db.verificationToken.delete({
      where: { id: existingToken.id },
    });
  }

  const verificationToken = await db.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return verificationToken;
};
