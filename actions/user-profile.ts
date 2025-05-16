'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export async function updateUserProfile(
  phone: string,
  address: string
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to update your profile",
        redirectToLogin: true
      };
    }
    
    const validation = profileSchema.safeParse({ phone, address });
    
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors[0].message
      };
    }
    
    // Use type assertion to update user with new fields
    // @ts-ignore - Prisma typings might not be updated yet after migration
    await db.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        address,
      }
    });

    revalidatePath('/booking-summary');
    
    return {
      success: true,
      message: "Profile updated successfully"
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update profile"
    };
  }
}

export async function getUserProfile() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to view your profile",
        redirectToLogin: true
      };
    }
    
    // Use type assertion for the select fields
    // @ts-ignore - Prisma typings might not be updated yet after migration
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      }
    });
    
    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch profile"
    };
  }
} 