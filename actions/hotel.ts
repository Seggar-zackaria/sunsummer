'use server';

import { db } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';
import { HotelSchema, HotelUpdateSchema } from '@/schemas/index';
import * as z from 'zod';
import { revalidatePath } from "next/cache";

export async function addHotel(values: z.infer<typeof HotelSchema>) {
  try {
    const validatedFields = HotelSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        status: 400,
        error: 'Invalid fields',
        message: validatedFields.error.message,
      };
    }

    const { images, ...hotelData } = validatedFields.data;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Process and save images
    const imageUrls = await Promise.all(
      images.map(async (file: File) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, fileName);
        
        await fs.writeFile(filePath, buffer);
        return `/uploads/${fileName}`;
      })
    );

    // Create hotel record with image URLs
    await db.hotel.create({
      data: {
        ...hotelData,
        images: imageUrls,
      },
    });

    return {
      status: 201,
      message: 'Hotel created successfully',
    };
  } catch (error) {
    console.error('Hotel creation error:', error);
    return {
      status: 500,
      error: 'Failed to create hotel',
    };
  }
}

export async function editHotel(
  hotelId: string,
  values: Partial<z.infer<typeof HotelSchema>>
) {
  try {
    const validatedFields = HotelUpdateSchema.safeParse({ id: hotelId, ...values });

    if (!validatedFields.success) {
      return {
        status: 400,
        error: 'Invalid fields',
        message: validatedFields.error.message,
      };
    }

    // Get current hotel data
    const existingHotel = await db.hotel.findUnique({
      where: { id: hotelId }
    });

    if (!existingHotel) {
      return {
        status: 404,
        error: 'Hotel not found'
      };
    }

    // Handle images separately
    let imageUrls = existingHotel.images;
    if (values.images && values.images.length > 0) {
      // TODO: Check what i can do with this func
      // Process new images only if provided
      // Your image processing logic here
    }

    // Only update fields that were provided in the values object
    const updateData = {
      ...(values.name && { name: values.name }),
      ...(values.description && { description: values.description }),
      ...(values.address && { address: values.address }),
      ...(values.city && { city: values.city }),
      ...(values.country && { country: values.country }),
      ...(values.state && { state: values.state }),
      ...(values.rating !== undefined && { rating: values.rating }),
      ...(values.price !== undefined && { price: values.price }),
      ...(values.amenities && { amenities: values.amenities }),
      ...(imageUrls && { images: imageUrls }),
    };

    await db.hotel.update({
      where: { id: hotelId },
      data: updateData,
    });

    return {
      status: 200,
      message: 'Hotel updated successfully',
    };
  } catch (error) {
    console.error('Hotel update error:', error);
    return {
      status: 500,
      error: 'Failed to update hotel',
    };
  }
}


/**
 * Deletes a hotel from the database
 * @param id - The ID of the hotel to delete
 * @returns Promise<{ success: boolean, message: string }>
 */
export async function deleteHotel(id: string) {
  try {
    const hotel = await db.hotel.findUnique({
      where: { id }
    });

    if (!hotel) {
      return {
        success: false,
        message: "Hotel not found"
      };
    }

    await db.hotel.delete({
      where: { id }
    });

    revalidatePath('/hotels');

    return {
      success: true,
      message: "Hotel deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete hotel"
    };
  }
}