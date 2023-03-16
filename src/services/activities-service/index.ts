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

async function createReserveInActivity(userId: number, activityId: number) {
  const userAlreadyHaveInActivity = await activityRepository.findActivityWithUserIdSeat(userId, activityId);
  if (userAlreadyHaveInActivity) throw new Error("Already have a seat in activity");

  const activity = await activityRepository.findActivityById(activityId);
  const availableSeats = await activityRepository.getCountOfSeatInActivity(activityId);

  if (activity.Hall.capacity <= availableSeats._count.id) throw new Error("No available seats in this activity");

  await activityRepository.reserveActivity(userId, activityId);
}

const activityService = {
  getActivities,
  createReserveInActivity,
};

export default activityService;
