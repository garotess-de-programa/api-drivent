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

async function findActivityWithUserIdSeat(userId: number, activityId: number) {
  return prisma.activity.findFirst({
    where: {
      Seat: {
        some: {
          userId,
        },
      },
      id: activityId,
    },
  });
}

async function getCountOfSeatInActivity(activityId: number) {
  return prisma.seat.aggregate({
    _count: {
      id: true,
    },
    where: {
      activity_Id: activityId,
    },
  });
}

async function findActivityById(activityId: number) {
  return prisma.activity.findUnique({
    where: {
      id: activityId,
    },
    include: {
      Hall: {
        select: {
          capacity: true,
        },
      },
    },
  });
}

async function reserveActivity(userId: number, activityId: number) {
  return prisma.seat.create({
    data: {
      userId,
      activity_Id: activityId,
    },
  });
}

const activityRepository = {
  findActivities,
  findActivitiesWithDateFilter,
  findActivityWithUserIdSeat,
  getCountOfSeatInActivity,
  findActivityById,
  reserveActivity,
};

export default activityRepository;
