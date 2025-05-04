import { db } from "@/lib/db";
import { User } from "@/lib/definitions";

const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const user = await db.user.findUnique({
    where: { email },
    include: {} 
   });

  if (!user) return undefined;

  return {
    ...user,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    password: user.password ?? undefined,
    emailVerified: user.emailVerified ?? undefined,
    image: user.image ?? undefined,
  };
};

const getUserById = async (id: string): Promise<User | undefined> => {
  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) return undefined;

  return {
    ...user,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    password: user.password ?? undefined,
    emailVerified: user.emailVerified ?? undefined,
    image: user.image ?? undefined,
    role: user.role ?? undefined,
  };
};


export { getUserByEmail, getUserById };
