import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import scheduleService from "@/services/schedules-service";

export async function getActivitiesDays(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const days = await scheduleService.getActivitiesDays(userId);
    return res.status(httpStatus.OK).send(days);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "cannotListActivitiesError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
