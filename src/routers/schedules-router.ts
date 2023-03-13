import { Router } from "express";
import { authenticateToken } from "@/middlewares";
// import { } from "@/controllers";

const schedulesRouter = Router();

schedulesRouter.all("/*", authenticateToken).get("/days", () => "get days that have activity");

export { schedulesRouter };
