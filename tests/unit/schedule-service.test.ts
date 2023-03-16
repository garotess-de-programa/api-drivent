/* eslint-disable @typescript-eslint/no-explicit-any */

import scheduleService from "@/services/schedules-service";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import scheduleRepository from "@/repositories/schedule-repository";

jest.mock("@/repositories/activity-repository");
jest.mock("@/repositories/enrollment-repository");
jest.mock("@/repositories/ticket-repository");

describe("getActivitiesDays() test suite", () => {
  describe("when throw error", () => {
    it("Should throw NotFoundError when there is no enrollment", async () => {
      const mockUserId = 1;
      const enrollmentRepositorySpy = jest
        .spyOn(enrollmentRepository, "findWithAddressByUserId")
        .mockImplementationOnce(null);

      try {
        await scheduleService.getActivitiesDays(mockUserId);
      } catch (error) {
        expect(error.name).toEqual("NotFoundError");
      }
      expect(enrollmentRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw cannotListActivitiesError when there is no ticket", async () => {
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
        await scheduleService.getActivitiesDays(mockUserId);
      } catch (error) {
        expect(error.name).toEqual("cannotListActivitiesError");
      }

      expect(ticketRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw cannotListActivitiesError when the ticket is remote", async () => {
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
        await scheduleService.getActivitiesDays(mockUserId);
      } catch (error) {
        expect(error.name).toEqual("cannotListActivitiesError");
      }

      expect(ticketRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw cannotListActivitiesError when the ticket doesn't include hotel", async () => {
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
        await scheduleService.getActivitiesDays(mockUserId);
      } catch (error) {
        expect(error.name).toEqual("cannotListActivitiesError");
      }

      expect(ticketRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw cannotListActivitiesError when the ticket is reserved", async () => {
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
        await scheduleService.getActivitiesDays(mockUserId);
      } catch (error) {
        expect(error.name).toEqual("cannotListActivitiesError");
      }

      expect(ticketRepositorySpy).toHaveBeenCalledWith(mockUserId);
    });

    it("Should throw noContentActivitiesDaysError when as empty activities days list", async () => {
      const mockUserId = 1;

      jest.spyOn(scheduleRepository, "findDays").mockImplementationOnce((): any => {
        return [];
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

      try {
        await scheduleService.getActivitiesDays(mockUserId);
      } catch (error) {
        expect(error.name).toEqual("noContentActivitiesDaysError");
      }
      expect(scheduleRepository.findDays).toHaveBeenCalledWith();
    });
  });

  it("should return activities days", async () => {
    const userId = 1;
    const expectedActivitiesDays = [
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
    ];

    jest.spyOn(scheduleRepository, "findDays").mockImplementationOnce((): any => {
      return [
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

    const days = await scheduleService.getActivitiesDays(userId);
    expect(scheduleRepository.findDays).toHaveBeenCalledWith();
    expect(days).toEqual(expectedActivitiesDays);
  });
});
