"use server";
import { RegisterSchema } from "@/schemas/index";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/app/api/send/route";
export const Register = async (values: z.infer<typeof RegisterSchema>) => {
  try {
    const { success, error } = RegisterSchema.safeParse(values);
    if (!success) {
      return { status: 400, error: "Invalid fields" };
    }
    const { email, password, name } = values;
    
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      return { error: "User already exists", status: 409 };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const verificationToken = await generateToken(email);
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

    return { success: "Confirmation email sent", status: 201 };
  } catch (error) {
    return { status: 500, error: "Internal server error" };
  }
};
