const Joi = require('joi').extend(require('@joi/date'));

const createTransactionSchema = Joi.object({
    amount: Joi.number().positive().required(), // Validasi amount harus angka positif
    source_account_id: Joi.number().integer().required(), // Validasi id akun sumber
    destination_account_id: Joi.number().integer().required(), // Validasi id akun tujuan
  });


const getTransactionByIdSchema = Joi.object({
    id: Joi.number().integer().required(), // Validasi id harus angka integer
  });

module.exports = { 
    createTransactionSchema,
    getTransactionByIdSchema
 }  