const Joi = require("joi").extend(require("@joi/date"));

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    identityType: Joi.string().valid("KTP", "Passport", "SIM").optional(),
    identityNumber: Joi.number().optional(),
    address: Joi.string().optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

// const getProfileSchema = Joi.object({
//     authorization: Joi.string().pattern(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/).required()
// }).unknown(true); // .unknown(true) untuk menerima header lainnya

module.exports = {
    registerSchema,
    loginSchema,
    // getProfileSchema
};
