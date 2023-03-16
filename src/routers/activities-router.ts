import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getActivities, postReserveInActivity } from "@/controllers";

const activityRouter = Router();

activityRouter.all("/*", authenticateToken).get("/", getActivities).post("/", postReserveInActivity);

export { activityRouter };
