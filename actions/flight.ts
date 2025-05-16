"use server";

import { db } from "@/lib/db";
import { flightSchema } from "@/schemas";
import * as z from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
const dateFns = require('date-fns');
const { parse, startOfDay, endOfDay } = dateFns;

// Define a type for the response
type FlightResponse<T = any> = {
  status: number;
  message?: string;
  error?: string;
  data?: T;
};

export async function addFlight(values: z.infer<typeof flightSchema>): Promise<FlightResponse> {
  try {
    const validatedFields = flightSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        status: 400,
        error: "Invalid fields",
        message: validatedFields.error.message,
      };
    }

    // Check for existing flight number on same date
    const existingFlight = await db.flight.findFirst({
      where: {
        flightNumber: validatedFields.data.flightNumber,
        departureTime: {
          gte: startOfDay(new Date(validatedFields.data.date)),
          lte: endOfDay(new Date(validatedFields.data.date)),
        },
      },
    });

    if (existingFlight) {
      return {
        status: 400,
        error: "Flight number already exists",
        message: "A flight with this number already exists on this date",
      };
    }

    const { date, departureTime, arrivalTime, ...flightData } = validatedFields.data;

    const departureDateTime = parse(
      `${date} ${departureTime}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );
    const arrivalDateTime = parse(
      `${date} ${arrivalTime}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );

    const flight = await db.flight.create({
      data: {
        ...flightData,
        departureTime: departureDateTime,
        arrivalTime: arrivalDateTime,
        duration: flightData.duration || 0,
        capacity: 180,
        availableSeats: 180,
      },
    });

    revalidatePath("/dashboard/admin/flight");

    return {
      status: 201,
      message: "Flight created successfully",
      data: flight,
    };
  } catch (error) {
    console.error("Flight creation error:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          status: 400,
          error: "Flight number already exists",
        };
      }
    }

    return {
      status: 500,
      error: "Failed to create flight",
    };
  }
}

export async function updateFlight(
  id: string,
  values: z.infer<typeof flightSchema>
) {
  try {
    const validatedFields = flightSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        status: 400,
        error: "Invalid fields",
        message: validatedFields.error.message,
      };
    }

    const { date, departureTime, arrivalTime, ...otherFields } = validatedFields.data;

    const departureDateTime = new Date(`${date}T${departureTime}`);
    const arrivalDateTime = new Date(`${date}T${arrivalTime}`);

    const flight = await db.flight.update({
      where: { id },
      data: {
        ...otherFields,
        departureTime: departureDateTime,
        arrivalTime: arrivalDateTime,
      },
    });

    revalidatePath("/dashboard/admin/flight");

    return {
      status: 200,
      message: "Flight updated successfully",
      data: flight,
    };
  } catch (error) {
    console.error("Flight update error:", error);
    return {
      status: 500,
      error: "Failed to update flight",
    };
  }
}

export async function deleteFlight(id: string) {
  try {
    await db.flight.delete({
      where: { id },
    });

    revalidatePath("/dashboard/admin/flight");

    return {
      status: 200,
      message: "Flight deleted successfully",
    };
  } catch (error) {
    console.error("Flight deletion error:", error);
    return {
      status: 500,
      error: "Failed to delete flight",
    };
  }
}

export async function getFlight(id: string) {
  try {
    const flight = await db.flight.findUnique({
      where: { id: id },
    });

    if (!flight) {
      return {
        status: 404,
        error: "Flight not found",
      };
    }

    return {
      status: 200,
      data: flight,
    };
  } catch (error) {
    console.error("Flight fetch error:", error);
    return {
      status: 500,
      error: "Failed to fetch flight",
    };
  }
}

export async function getAllFlights() {
  try {
    const flights = await db.flight.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        flightNumber: true,
        departureCity: true,
        arrivalCity: true,
        departureTime: true,
        arrivalTime: true,
        status: true,
        price: true,
        stops: true,
        airline: true
      }
    });

    return {
      status: 200,
      data: flights,
    };
  } catch (error) {
    console.error("Flights fetch error:", error);
    return {
      status: 500,
      error: "Failed to fetch flights",
    };
  }
}

export async function searchFlights({
  from,
  to,
  date,
}: {
  from: string;
  to: string;
  date?: string;
}) {
  try {
    const where: any = {
      departureCity: { contains: from, mode: "insensitive" },
      arrivalCity: { contains: to, mode: "insensitive" },
    };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.departureTime = { gte: start, lte: end };
    }

    const flights = await db.flight.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        flightNumber: true,
        departureCity: true,
        arrivalCity: true,
        departureTime: true,
        arrivalTime: true,
        status: true,
        price: true,
        duration: true,
        stops: true,
        airline: true,
      },
    });

    return { status: 200, data: flights };
  } catch (error) {
    console.error("Flights search error:", error);
    return { status: 500, error: "Failed to search flights" };
  }
}
