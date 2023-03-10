import "reflect-metadata";
import "express-async-errors";
import express, { Express } from "express";
import cors from "cors";

import { loadEnv, connectDb, disconnectDB } from "@/config";

loadEnv();

import { handleApplicationErrors } from "@/middlewares";
import * as r from "@/routers";

const app = express();
app
  .use(cors())
  .use(express.json())
  .get("/health", (_req, res) => res.send("OK!"))
  .use("/users", r.usersRouter)
  .use("/auth", r.authenticationRouter)
  .use("/event", r.eventsRouter)
  .use("/enrollments", r.enrollmentsRouter)
  .use("/tickets", r.ticketsRouter)
  .use("/payments", r.paymentsRouter)
  .use("/hotels", r.hotelsRouter)
  .use("/booking", r.bookingRouter)
  .use(handleApplicationErrors);

export function init(): Promise<Express> {
  connectDb();
  return Promise.resolve(app);
}

export async function close(): Promise<void> {
  await disconnectDB();
}

export default app;
