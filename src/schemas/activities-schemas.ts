import Joi from "joi";

export const createActivitySchema = Joi.object<{ activityId: number }>({
  activityId: Joi.number().required(),
});
