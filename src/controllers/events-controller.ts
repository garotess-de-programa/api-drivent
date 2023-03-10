import eventsService from "@/services/events-service";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { redis } from "@/config";

const EXPIRATION = 10000;

export async function getDefaultEvent(_req: Request, res: Response) {
  const eventkey = "event";
  try {
    const cachedEvent = await redis.get(eventkey);
    if(cachedEvent){
      return res.status(httpStatus.OK).send(JSON.parse(cachedEvent));
    }else{
      const event = await eventsService.getFirstEvent();
      redis.setEx(eventkey, EXPIRATION, JSON.stringify(event));
      return res.status(httpStatus.OK).send(event);
    }
  } catch (error) {
    return res.status(httpStatus.NOT_FOUND).send({});
  }
}
