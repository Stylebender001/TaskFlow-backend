import Joi from "joi";

export function validateJob(data) {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    skillsRequired: Joi.array().items(Joi.string()).required(),
    location: Joi.string().required(),
  });

  return schema.validate(data);
}
