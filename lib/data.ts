import { db } from "@/lib/db";

export async function getUsers() {
const users = await db.user.findMany({
  orderBy: {
    createdAt: 'desc'
  },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    }
});

return users;
}


export const UserCount = async () => {
  const user = await db.user.count()
  
  return user
}

export const HotelCount = async () => {
  const hotel = await db.hotelBooking.count()
  
  return hotel
}
export const FlightCount = async () => {
  const flight = await db.flightBooking.count()
  
  return flight
}

export async function getUserCountsByMonth() {
  const currentYear = new Date().getFullYear();
  
  const counts = await db.$queryRaw<Array<{ month: number; count: bigint }>>`
    SELECT 
      EXTRACT(MONTH FROM created_at) as month,
      COUNT(*) as count
    FROM users
    WHERE 
      EXTRACT(YEAR FROM created_at) = ${currentYear}
    GROUP BY 
      EXTRACT(MONTH FROM created_at)
    ORDER BY 
      month ASC`;

  // Convert to the format expected by the chart
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return counts.map(item => ({
    month: monthNames[Number(item.month) - 1],
    users: Number(item.count)
  }));
}



export const getHotelList = async () => {
  const hotel = await db.hotel.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      name: true,
      country: true,
      city: true,
      price: true,
      images    : true,
      description: true,
      rating: true,
      amenities: true,
      state: true,
      createdAt: true,
    }
  })

  return hotel
}

