import { faker } from "@faker-js/faker";
import { prisma } from "@/config";

export async function createActivity(
  { startTime, endTime } = {
    startTime: new Date("2023-03-18T11:30:00.000Z"),
    endTime: new Date("2023-03-18T12:30:00.000Z"),
  },
) {
  return await prisma.activity.create({
    data: {
      name: faker.name.findName(),
      Hall: {
        create: {
          name: faker.name.findName(),
          capacity: faker.datatype.number({ max: 27, min: 10 }),
        },
      },
      Schedule: {
        create: {
          startTime,
          endTime,
        },
      },
    },
    include: {
      Hall: true,
      Schedule: true,
      Seat: true,
    },
  });
}
