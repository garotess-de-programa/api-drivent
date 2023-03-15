/* eslint-disable @typescript-eslint/no-explicit-any */

import activityService from "@/services/activities-service";
import activityRepository from "@/repositories/activity-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

jest.mock("@/repositories/activity-repository");
jest.mock("@/repositories/enrollment-repository");
jest.mock("@/repositories/ticket-repository");

describe("getActivities() test suite", () => {
  describe("when throw error", () => {
    it("Should throw NotFoundError when there is no enrollment", async () => {
      let date;
      const mockUserId = 1;
      const enrollmentRepositorySpy = jest
        .spyOn(enrollmentRepository, "findWithAddressByUserId")
        .mockImplementationOnce(null);

      try {
        await activityService.getActivities(mockUserId, date);
      } catch (error) {
        expect(error.name).toEqual("NotFoundError");
      }
      expect(enrollmentRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw cannotListActivitiesError when there is no ticket", async () => {
      let date;
      const mockUserId = 1;
      jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
        return { id: 1 };
      });

      const ticketRepositorySpy = jest
        .spyOn(ticketRepository, "findTicketByEnrollmentId")
        .mockImplementationOnce((): any => {
          return undefined;
        });

      try {
        await activityService.getActivities(mockUserId, date);
      } catch (error) {
        expect(error.name).toEqual("cannotListActivitiesError");
      }

      expect(ticketRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw cannotListActivitiesError when the ticket is remote", async () => {
      let date;
      const mockUserId = 1;
      jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
        return { id: 1 };
      });

      const ticketRepositorySpy = jest
        .spyOn(ticketRepository, "findTicketByEnrollmentId")
        .mockImplementationOnce((): any => {
          return {
            status: "PAID",
            TicketType: { isRemote: true, includesHotel: true },
          };
        });

      try {
        await activityService.getActivities(mockUserId, date);
      } catch (error) {
        expect(error.name).toEqual("cannotListActivitiesError");
      }

      expect(ticketRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw cannotListActivitiesError when the ticket doesn't include hotel", async () => {
      let date;
      const mockUserId = 1;
      jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
        return { id: 1 };
      });

      const ticketRepositorySpy = jest
        .spyOn(ticketRepository, "findTicketByEnrollmentId")
        .mockImplementationOnce((): any => {
          return {
            status: "PAID",
            TicketType: { isRemote: false, includesHotel: false },
          };
        });

      try {
        await activityService.getActivities(mockUserId, date);
      } catch (error) {
        expect(error.name).toEqual("cannotListActivitiesError");
      }

      expect(ticketRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw cannotListActivitiesError when the ticket is reserved", async () => {
      let date;
      const mockUserId = 1;
      jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
        return { id: 1 };
      });

      const ticketRepositorySpy = jest
        .spyOn(ticketRepository, "findTicketByEnrollmentId")
        .mockImplementationOnce((): any => {
          return {
            status: "RESERVED",
            TicketType: { isRemote: false, includesHotel: true },
          };
        });

      try {
        await activityService.getActivities(mockUserId, date);
      } catch (error) {
        expect(error.name).toEqual("cannotListActivitiesError");
      }

      expect(ticketRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw an Error when an invalid date is provided", async () => {
      let date;
      const mockUserId = 1;
      jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
        return { id: 1 };
      });

      const ticketRepositorySpy = jest
        .spyOn(ticketRepository, "findTicketByEnrollmentId")
        .mockImplementationOnce((): any => {
          return {
            status: "PAID",
            TicketType: { isRemote: false, includesHotel: true },
          };
        });

      try {
        await activityService.getActivities(mockUserId, date);
      } catch (error) {
        expect(error.name).toEqual("Error");
      }

      expect(ticketRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });
  });

  it("should return all activities when no date is provided", async () => {
    let date;
    const userId = 1;
    const expectedActivities = [
      { id: 1, name: "Activity 1", startTime: "2023-03-18" },
      { id: 2, name: "Activity 2", startTime: "2023-03-19" },
    ];

    jest.spyOn(activityRepository, "findActivities").mockImplementationOnce((): any => {
      return [
        { id: 1, name: "Activity 1", startTime: "2023-03-18" },
        { id: 2, name: "Activity 2", startTime: "2023-03-19" },
      ];
    });
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
      return { id: 1 };
    });
    jest.spyOn(ticketRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => {
      return {
        status: "PAID",
        TicketType: { isRemote: false, includesHotel: true },
      };
    });

    const activities = await activityService.getActivities(userId, date);

    // expect(activityRepository.findActivities).toHaveBeenCalledTimes(1);
    expect(activityRepository.findActivities).toHaveBeenCalledWith();
    expect(activities).toEqual(expectedActivities);
  });

  it("should return activities when an valid date is provided", async () => {
    const userId = 1;
    const date = "2023-03-18";
    const expectedActivities = [{ id: 1, name: "Activity 1", startTime: "2023-03-18" }];

    jest.spyOn(activityRepository, "findActivitiesWithDateFilter").mockImplementationOnce((): any => {
      return [{ id: 1, name: "Activity 1", startTime: "2023-03-18" }];
    });
    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
      return { id: 1 };
    });
    jest.spyOn(ticketRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => {
      return {
        status: "PAID",
        TicketType: { isRemote: false, includesHotel: true },
      };
    });

    const activities = await activityService.getActivities(userId, date);

    // expect(activityRepository.findActivities).toHaveBeenCalledTimes(1);
    expect(activityRepository.findActivities).toHaveBeenCalledWith();
    expect(activities).toEqual(expectedActivities);
  });
});
