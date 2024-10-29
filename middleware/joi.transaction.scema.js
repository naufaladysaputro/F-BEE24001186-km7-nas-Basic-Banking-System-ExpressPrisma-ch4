const Joi = require('joi').extend(require('@joi/date'));

const createTransactionSchema = Joi.object({
    amount: Joi.number().positive().required(), // Validasi amount harus angka positif
    sourceAccountId: Joi.number().integer().required(), // Validasi id akun sumber
    destinationAccountId: Joi.number().integer().required(), // Validasi id akun tujuan
  });


const getTransactionByIdSchema = Joi.object({
    id: Joi.number().integer().required(), // Validasi id harus angka integer
  });

module.exports = { 
    createTransactionSchema,
    getTransactionByIdSchema
 }  