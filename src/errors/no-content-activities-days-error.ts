import { ApplicationError } from "@/protocols";

export function noContentActivitiesDaysError(): ApplicationError {
  return {
    name: "noContentActivitiesDaysError",
    message: "No activities days",
  };
}
