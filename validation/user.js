import Joi from "joi";

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(6).max(1024).required(),
    role: Joi.string().valid("admin", "customer", "worker").default("customer"),
  });
  return schema.validate(user);
}

export default validateUser;
