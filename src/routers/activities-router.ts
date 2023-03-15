import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getActivities } from "@/controllers";

const activityRouter = Router();

activityRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .post("/reserve-seat", () => "post a seat by userId and activityId");

export { activityRouter };
