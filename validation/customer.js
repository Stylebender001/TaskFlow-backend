import Joi from "joi";

export const validateCustomer = (customer) => {
  const schema = Joi.object({
    location: Joi.string().min(1).required(),
    phoneNo: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits",
      }),
  });

  return schema.validate(customer);
};
