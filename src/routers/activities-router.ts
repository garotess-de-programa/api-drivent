import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getActivities, postReserveInActivity } from "@/controllers";
import { createActivitySchema } from "@/schemas/activities-schemas";

const activityRouter = Router();

activityRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .post("/", validateBody(createActivitySchema), postReserveInActivity);

export { activityRouter };
