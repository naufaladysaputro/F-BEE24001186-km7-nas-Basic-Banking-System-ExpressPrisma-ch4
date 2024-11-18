const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    identityType: Joi.string().valid("KTP", "Passport", "SIM").optional(),
    identityNumber: Joi.number().optional(),
    address: Joi.string().optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    newPassword: Joi.string().min(6).required(),
});

module.exports = { registerSchema, loginSchema, resetPasswordSchema };
