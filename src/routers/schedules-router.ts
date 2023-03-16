import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getActivitiesDays } from "@/controllers";

const schedulesRouter = Router();

schedulesRouter.all("/*", authenticateToken).get("/days", getActivitiesDays);

export { schedulesRouter };
