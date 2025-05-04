import {db }from "@/lib/db"

export const getVerificationTokenByEmail = async (identifier: string) => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { identifier },
    });
    return verificationToken;
  } catch (error) {
    console.error(error);
  }
};

export const getVerificationToken = async (token: string) => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { token },
    });
    return verificationToken;
  } catch (error) {
    console.error(error);
  }
};
