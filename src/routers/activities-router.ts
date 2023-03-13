import { Router } from "express";
import { authenticateToken } from "@/middlewares";
// import { } from "@/controllers";

const activityRouter = Router();

activityRouter
  .all("/*", authenticateToken)
  .get("/", () => "get activities || use query to filter activities in day")
  .post("/reserve-seat", () => "post a seat by userId and activityId");

export { activityRouter };
