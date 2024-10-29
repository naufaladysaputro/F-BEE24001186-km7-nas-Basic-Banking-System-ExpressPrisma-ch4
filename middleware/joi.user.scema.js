const Joi = require('joi').extend(require('@joi/date'));

const getUserByIdSchema = Joi.object({
    id: Joi.number().required()
});

const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().min(6).required(),
    identityNumber: Joi.number().optional(),
    address: Joi.string().optional(),
    identityType: Joi.string().valid('KTP', 'Passport', 'SIM').optional() // Tambahkan validasi untuk identity_type
});

const updateUserSchema = Joi.object({
    email: Joi.string().email().optional(),
    name: Joi.string().optional(),
    password: Joi.string().min(6).optional(),
    identityNumber: Joi.number().optional(),
    address: Joi.string().optional(),
    identityType: Joi.string().valid('KTP', 'Passport', 'SIM').optional() // Tambahkan validasi untuk identity_type
});

const deleteUsersByIdSchema = Joi.object({
    id: Joi.number().required()
});


module.exports = {
    createUserSchema,
    updateUserSchema,
    getUserByIdSchema,
    deleteUsersByIdSchema
};



