import { prisma } from "@/config";

async function findHotels() {
  return prisma.$queryRaw`
    WITH rooms_hotels AS (
      SELECT
        hotels.id,
        COUNT(boo."userId") as users
      FROM
        "Hotel" hotels
      INNER JOIN "Room" rooms ON rooms."hotelId" = hotels.id
      INNER JOIN "Booking" boo ON boo."roomId" = rooms.id
      GROUP BY hotels.id
    )
    SELECT
      hotels.id,
      hotels.name,
      hotels.image,
      MAX(rooms.capacity) AS capacity,
      SUM(rooms.capacity) - rooms_hotels.users AS "availableRooms"
    FROM 
      "Room" rooms 
    INNER JOIN "Hotel" hotels ON rooms."hotelId" = hotels.id
    INNER JOIN rooms_hotels ON rooms_hotels.id = hotels.id
    GROUP BY 
      hotels.id,
      rooms_hotels.users
  `;
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
};

export default hotelRepository;
