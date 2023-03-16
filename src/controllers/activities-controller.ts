import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import activityService from "@/services/activities-service";
import httpStatus from "http-status";

export async function getActivities(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const date = req.query?.date;

  try {
    const activities = await activityService.getActivities(Number(userId), date as string | undefined);
    return res.status(httpStatus.OK).send(activities);
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

export async function postReserveInActivity(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityId } = req.body;

  try {
    await activityService.createReserveInActivity(+userId, +activityId);
    return res.sendStatus(httpStatus.CREATED);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
