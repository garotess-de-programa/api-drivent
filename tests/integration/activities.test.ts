import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createPayment,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createActivity,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /activities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activities");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user has no enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      await createTicketTypeRemote();

      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 402 when user ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 and a list of activities", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      const createdActivity = await createActivity();

      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);

      expect(response.body).toEqual([
        {
          ...createdActivity,
          Hall: {
            ...createdActivity.Hall,
            createdAt: createdActivity.Hall.createdAt.toISOString(),
            updatedAt: createdActivity.Hall.updatedAt.toISOString(),
          },
          Schedule: {
            ...createdActivity.Schedule,
            endTime: createdActivity.Schedule.endTime.toISOString(),
            startTime: createdActivity.Schedule.startTime.toISOString(),
            createdAt: createdActivity.Schedule.createdAt.toISOString(),
            updatedAt: createdActivity.Schedule.updatedAt.toISOString(),
          },
          createdAt: createdActivity.createdAt.toISOString(),
          updatedAt: createdActivity.updatedAt.toISOString(),
        },
      ]);
    });

    it("should respond with status 200 and a list of activities with date filter", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      // created activities out of date filtered
      await createActivity({
        startTime: new Date("2023-03-11T10:30:00.000Z"),
        endTime: new Date("2023-03-11T11:30:00.000Z"),
      });
      await createActivity({
        startTime: new Date("2023-03-19T11:30:00.000Z"),
        endTime: new Date("2023-03-19T12:30:00.000Z"),
      });

      const createdActivity = await createActivity();

      const response = await server.get("/activities?date=2023-03-18").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body.length).toEqual(1);

      expect(response.body).toEqual([
        {
          ...createdActivity,
          Hall: {
            ...createdActivity.Hall,
            createdAt: createdActivity.Hall.createdAt.toISOString(),
            updatedAt: createdActivity.Hall.updatedAt.toISOString(),
          },
          Schedule: {
            ...createdActivity.Schedule,
            endTime: createdActivity.Schedule.endTime.toISOString(),
            startTime: createdActivity.Schedule.startTime.toISOString(),
            createdAt: createdActivity.Schedule.createdAt.toISOString(),
            updatedAt: createdActivity.Schedule.updatedAt.toISOString(),
          },
          createdAt: createdActivity.createdAt.toISOString(),
          updatedAt: createdActivity.updatedAt.toISOString(),
        },
      ]);
    });

    it("should respond with status 200 and an empty array", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([]);
    });
  });
});

describe("POST /activities", () => {
  const createValidBody = (id: number) => ({ activityId: id });
  const createInvalidBody = (id: number) => ({ activityIdd: id });

  it("should respond with status 401 if no token is given", async () => {
    const validBody = createValidBody(0);
    const response = await server.post("/activities").send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const validBody = createValidBody(0);

    const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const validBody = createValidBody(0);
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 201 with a valid body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      const createdActivity = await createActivity();
      const validBodyWithValidIdActivity = createValidBody(createdActivity.id);

      const response = await server
        .post("/activities")
        .set("Authorization", `Bearer ${token}`)
        .send(validBodyWithValidIdActivity);

      expect(response.status).toEqual(httpStatus.CREATED);
    });

    it("should respond with status 400 with a invalid body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      const createdActivity = await createActivity();
      const invalidBodyWithValidIdActivity = createInvalidBody(createdActivity.id);

      const response = await server
        .post("/activities")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidBodyWithValidIdActivity);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });
  });
});
