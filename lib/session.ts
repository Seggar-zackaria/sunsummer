"use server";

import { signOut } from "next-auth/react";

export async function LogOutSession(): Promise<string | void> {
  await signOut();
  return ;
}
