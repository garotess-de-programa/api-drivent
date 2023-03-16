import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import {
  createActivity,
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createUser,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /schedules/days", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/schedules/days");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/schedules/days").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/schedules/days").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user has no enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      await createTicketTypeRemote();

      const response = await server.get("/schedules/days").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 402 when user ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      const response = await server.get("/schedules/days").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 and a list of activities days", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      await createActivity({
        startTime: new Date("2023-03-11T10:30:00.000Z"),
        endTime: new Date("2023-03-11T11:30:00.000Z"),
      });
      await createActivity({
        startTime: new Date("2023-03-15T11:30:00.000Z"),
        endTime: new Date("2023-03-15T12:30:00.000Z"),
      });
      await createActivity({
        startTime: new Date("2023-03-19T11:30:00.000Z"),
        endTime: new Date("2023-03-19T12:30:00.000Z"),
      });

      const response = await server.get("/schedules/days").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body.length).toBe(3);

      expect(response.body).toEqual([
        {
          day: "2023-03-19",
          count: 1,
        },
        {
          day: "2023-03-15",
          count: 1,
        },
        {
          day: "2023-03-11",
          count: 1,
        },
      ]);
    });
  });
});
