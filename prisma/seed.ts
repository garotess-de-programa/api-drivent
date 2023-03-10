import { PrismaClient, TicketStatus } from "@prisma/client";
import dayjs from "dayjs";

import * as factory from "./factory";

const prisma = new PrismaClient();

async function main() {
  await factory.cleanDb();

  let user = await prisma.user.findUnique({
    where: {
      email: "programmer@gmail.com",
    },
  });

  if (!user) {
    user = await factory.createUser({
      email: "programmer@gmail.com",
      password: "123456",
    });
  }

  console.log("🌱 user with email <programmer@gmail.com> created!");

  let user2 = await prisma.user.findUnique({
    where: {
      email: "user2@gmail.com",
    },
  });

  if (!user2) {
    user = await factory.createUser({
      email: "user2@gmail.com",
      password: "123456",
    });
  }

  console.log("🌱 user with email <user2@gmail.com> created!");

  const enrollment = await factory.createEnrollmentWithAddress(user);
  console.log("🌱 user enrollment created!");

  await factory.createTicketTypeRemote();
  console.log("🌱 remote ticket type created!");

  await factory.createTicketTypeWithoutTheHotel();
  console.log("🌱 presential without hotel ticket type created!");

  const ticketType = await factory.createTicketTypeWithTheHotel();
  console.log("🌱 presential with hotel ticket type created!");

  const ticket = await factory.createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  console.log("🌱 user ticket paid created!");

  // create payment
  await factory.createPayment(ticket.id, ticketType.price);
  console.log("🌱 user payment created!");

  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
  }
  console.log("🌱 event Driven.t created!");

  await factory.createHotels(user, user2);
  console.log("🌱 hotels with rooms created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

