import Joi from "joi";

export function validateWorker(body) {
  const schema = Joi.object({
    skills: Joi.array().items(Joi.string()).min(1).required(),
    location: Joi.string().min(3).required(),
  });

  return schema.validate(body);
}
