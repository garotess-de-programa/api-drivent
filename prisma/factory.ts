import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import { PrismaClient, TicketStatus, User } from "@prisma/client";
import { generateCPF, getStates } from "@brazilian-utils/brazilian-utils";

const prisma = new PrismaClient();

export async function createHotels(user: User) {
  const rooms = [
    {
      name: faker.commerce.productName(),
      capacity: 3,
      Booking: {
        create: [
          {
            userId: 1339,
          },
          {
            userId: 1340,
          },
          {
            userId: 1341,
          },
        ],
      },
    },
    {
      name: faker.commerce.productName(),
      capacity: 2,
      Booking: {
        create: [
          {
            userId: 1339,
          },
          {
            userId: 1338,
          },
        ],
      },
    },
    {
      name: faker.commerce.productName(),
      capacity: 2,
      Booking: {
        create: {
          userId: user.id,
        },
      },
    },
    {
      name: faker.commerce.productName(),
      capacity: 3,
      Booking: {
        create: [
          {
            userId: 1338,
          },
          {
            userId: user.id,
          },
        ],
      },
    },
  ];
  const hotels = [
    {
      name: faker.company.companyName(),
      image: faker.image.imageUrl(900, 600, "city"),
      Rooms: {
        create: rooms,
      },
    },
    {
      name: faker.company.companyName(),
      image: faker.image.imageUrl(900, 600, "city"),
      Rooms: {
        create: rooms,
      },
    },
    {
      name: faker.company.companyName(),
      image: faker.image.imageUrl(900, 600, "city"),
      Rooms: {
        create: rooms,
      },
    },
  ];
  await Promise.all(
    hotels.map(async (hotel) => {
      await prisma.hotel.create({
        data: hotel,
        include: {
          Rooms: {
            include: {
              Booking: true,
            },
          },
        },
      });
    }),
  );
}
export async function createUser(params: Partial<User> = {}): Promise<User> {
  const incomingPassword = params.password || faker.internet.password(6);
  const hashedPassword = await bcrypt.hash(incomingPassword, 10);

  return prisma.user.create({
    data: {
      email: params.email || faker.internet.email(),
      password: hashedPassword,
    },
  });
}
export async function createEnrollmentWithAddress(user?: User) {
  const incomingUser = user || (await createUser());

  return prisma.enrollment.create({
    data: {
      name: faker.name.findName(),
      cpf: generateCPF(),
      birthday: faker.date.past(),
      phone: faker.phone.phoneNumber("(##) 9####-####"),
      userId: incomingUser.id,
      Address: {
        create: {
          street: faker.address.streetName(),
          cep: faker.address.zipCode(),
          city: faker.address.city(),
          neighborhood: faker.address.city(),
          number: faker.datatype.number().toString(),
          state: faker.helpers.arrayElement(getStates()).name,
        },
      },
    },
    include: {
      Address: true,
    },
  });
}
export async function createTicketTypeWithHotel() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: false,
      includesHotel: true,
    },
  });
}
export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}
export async function createPayment(ticketId: number, value: number) {
  return prisma.payment.create({
    data: {
      ticketId,
      value,
      cardIssuer: faker.name.findName(),
      cardLastDigits: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
    },
  });
}
export async function cleanDb() {
  await prisma.address.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});
}
