import { cannotListActivitiesError, notFoundError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

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

async function verifyTicketInformations(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw cannotListActivitiesError();
}

const activityService = {
  getActivities,
};

export default activityService;
