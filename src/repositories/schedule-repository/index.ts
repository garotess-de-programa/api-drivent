import { prisma } from "@/config";

async function findDays() {
  return prisma.$queryRaw`
    SELECT
      DATE("startTime") as "day",
      COUNT(*) as count
    FROM "Schedule"
    GROUP BY "startDate";
  `;
}

const scheduleRepository = {
  findDays,
};

export default scheduleRepository;
