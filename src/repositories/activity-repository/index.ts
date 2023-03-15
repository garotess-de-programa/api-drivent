import { prisma } from "@/config";

async function findActivities() {
  return prisma.activity.findMany({
    include: {
      Schedule: true,
      Hall: true,
      Seat: {
        select: {
          userId: true,
        },
      },
    },
  });
}

async function findActivitiesWithDateFilter(date: string) {
  return prisma.activity.findMany({
    where: {
      Schedule: {
        startTime: new Date(date),
      },
    },
    include: {
      Schedule: true,
      Hall: true,
      Seat: {
        select: {
          userId: true,
        },
      },
    },
  });
}

const activityRepository = {
  findActivities,
  findActivitiesWithDateFilter,
};

export default activityRepository;
