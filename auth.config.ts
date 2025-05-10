import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas";
import type { NextAuthConfig } from "next-auth";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google"

export const authConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validateFields = LoginSchema.safeParse(credentials);
        if (!validateFields.success) {
          throw new Error("Invalid input");
        }

        const { email, password } = validateFields.data;

        const existingUser = await getUserByEmail(email);

        if (!existingUser || !existingUser.password) {
          throw new Error("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(
          password,
          existingUser.password
        );
        if (!passwordMatch) {
          throw new Error("Invalid email or password");
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          image: existingUser.image,
          role: existingUser.role,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,

} satisfies NextAuthConfig;
