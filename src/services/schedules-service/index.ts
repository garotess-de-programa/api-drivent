import { noContentActivitiesDaysError } from "@/errors";
import { verifyTicketInformations } from "@/helpers/verifyTicketInformations-helper";
import scheduleRepository from "@/repositories/schedule-repository";

async function getActivitiesDays(userId: number) {
  await verifyTicketInformations(userId);

  const days = (await scheduleRepository.findDays()) as [];

  if (!days.length) throw noContentActivitiesDaysError();

  return days;
}
const scheduleService = {
  getActivitiesDays,
};

export default scheduleService;
