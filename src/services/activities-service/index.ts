import { verifyTicketInformations } from "@/helpers/verifyTicketInformations-helper";
import activityRepository from "@/repositories/activity-repository";

async function getActivities(userId: number, dateFilter: string | undefined) {
  await verifyTicketInformations(userId);

  let activities;
  const startDate = new Date(dateFilter);

  if (dateFilter) {
    if (isNaN(startDate.getTime())) throw new Error("Data inválida");

    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    activities = activityRepository.findActivitiesWithDateFilter(startDate, endDate);
  } else {
    activities = activityRepository.findActivities();
  }

  return activities;
}

const activityService = {
  getActivities,
};

export default activityService;
