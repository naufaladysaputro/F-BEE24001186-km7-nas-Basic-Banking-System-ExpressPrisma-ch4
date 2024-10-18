const Joi = require('joi').extend(require('@joi/date'));

const createUserSchema = Joi.object({ 
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().min(6).required(),
    identity_number : Joi.number().optional(),
    address: Joi.string().optional(),
    identity_type: Joi.string().valid('KTP', 'Passport', 'SIM').optional() // Tambahkan validasi untuk identity_type
});

module.exports = { createUserSchema };

