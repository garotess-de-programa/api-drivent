import { cannotListActivitiesError, notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function verifyTicketInformations(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw cannotListActivitiesError();
}
export { verifyTicketInformations };
