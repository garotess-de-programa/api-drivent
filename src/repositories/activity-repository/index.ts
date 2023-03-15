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

async function findActivitiesWithDateFilter(startDate: Date, endDate: Date) {
  return prisma.activity.findMany({
    where: {
      Schedule: {
        startTime: {
          gte: startDate,
          lt: endDate,
        },
      },
    },
    include: {
      Schedule: true,
      Hall: true,
      Seat: true,
    },
  });
}

const activityRepository = {
  findActivities,
  findActivitiesWithDateFilter,
};

export default activityRepository;
