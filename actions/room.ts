'use server';

import { db } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';
import { RoomSchema, RoomUpdateSchema } from '@/schemas/index';
import * as z from 'zod';
import { revalidatePath } from "next/cache";

export async function addRoom(values: z.infer<typeof RoomSchema>) {
  try {
    const validatedFields = RoomSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        status: 400,
        error: 'Invalid fields',
        message: validatedFields.error.message,
      };
    }

    const { images, ...roomData } = validatedFields.data;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public/uploads/rooms');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Process and save images
    const imageUrls = await Promise.all(
      images.map(async (file: File) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, fileName);
        
        await fs.writeFile(filePath, buffer);
        return `/uploads/rooms/${fileName}`;
      })
    );

    // Create room record with image URLs
    await db.room.create({
      data: {
        ...roomData,
        images: imageUrls,
      },
    });

    revalidatePath('/dashboard/admin/rooms');
    
    return {
      status: 201,
      message: 'Room created successfully',
    };
  } catch (error) {
    console.error('Room creation error:', error);
    return {
      status: 500,
      error: 'Failed to create room',
    };
  }
}


export async function getHotels() {
  try {
    const hotels = await db.hotel.findMany({
      select: { 
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    return hotels;
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return [];
  }
}

export async function editRoom(
  roomId: string,
  values: Partial<z.infer<typeof RoomSchema>>
) {
  try {
    const validatedFields = RoomUpdateSchema.safeParse({ id: roomId, ...values });

    if (!validatedFields.success) {
      return {
        status: 400,
        error: 'Invalid fields',
        message: validatedFields.error.message,
      };
    }

    const existingRoom = await db.room.findUnique({
      where: { id: roomId }
    });

    if (!existingRoom) {
      return {
        status: 404,
        error: 'Room not found'
      };
    }

    let imageUrls = existingRoom.images;
    if (values.images && values.images.length > 0) {
      // Process new images
      const uploadsDir = path.join(process.cwd(), 'public/uploads/rooms');
      await fs.mkdir(uploadsDir, { recursive: true });

      imageUrls = await Promise.all(
        values.images.map(async (file: File) => {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = path.join(uploadsDir, fileName);
          
          await fs.writeFile(filePath, buffer);
          return `/uploads/rooms/${fileName}`;
        })
      );
    }

    const updateData = {
      ...(values.type && { type: values.type }),
      ...(values.description && { description: values.description }),
      ...(values.capacity !== undefined && { capacity: values.capacity }),
      ...(values.price !== undefined && { price: values.price }),
      ...(values.available !== undefined && { available: values.available }),
      ...(values.amenities && { amenities: values.amenities }),
      ...(imageUrls && { images: imageUrls }),
    };

    await db.room.update({
      where: { id: roomId },
      data: updateData,
    });

    revalidatePath('/dashboard/admin/rooms');

    return {
      status: 200,
      message: 'Room updated successfully',
    };
  } catch (error) {
    console.error('Room update error:', error);
    return {
      status: 500,
      error: 'Failed to update room',
    };
  }
}

export async function getRoomsByHotelId(hotelId: string) {
  try {
    const rooms = await db.room.findMany({
      where: { hotelId },
      select: {
        id: true,
        type: true,
        description: true,
        capacity: true,
        price: true,
        available: true,
        amenities: true,
        images: true,
      }
    });
    return rooms;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
} 

export async function deleteRoom(roomId: string) {
  try {
    await db.room.delete({
      where: { id: roomId },
    });

    revalidatePath('/dashboard/admin/rooms');

    return {
      status: 200,
      message: 'Room deleted successfully',
    };
  } catch (error) {
    console.error('Room deletion error:', error);
    return {
      status: 500,
      error: 'Failed to delete room',
    };
  }
}