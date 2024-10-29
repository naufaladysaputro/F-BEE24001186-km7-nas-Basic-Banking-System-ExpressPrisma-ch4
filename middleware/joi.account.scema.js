const Joi = require('joi').extend(require('@joi/date'));


const createAccountSchema = Joi.object({
    bankName: Joi.string().required().messages({
      "string.empty": "Bank name is required"
    }),
    accountNumber: Joi.number().required().messages({
      "string.empty": "Account number is required"
    }),
    balance: Joi.number().min(0).required().messages({
      "number.base": "Balance must be a number",
      "number.min": "Balance cannot be negative",
      "any.required": "Balance is required"
    }),
    userId: Joi.number().integer().required().messages({
      "number.base": "User ID must be a number",
      "any.required": "User ID is required"
    })
  });

  const getAccountByIdSchema = Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": "Account ID must be a number",
      "any.required": "Account ID is required"
    })
  });

  const updateAccountSchema = Joi.object({
    bankName: Joi.string().optional(),
    accountNumber: Joi.number().optional(),
    balance: Joi.number().min(0).optional().messages({
      "number.base": "Balance must be a number",
      "number.min": "Balance cannot be negative"
    })
  });

  const deleteAccountSchema = Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": "Account ID must be a number",
      "any.required": "Account ID is required"
    })
  });

  const depositSchema = Joi.object({
    amount: Joi.number().positive().required().messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be a positive number",
      "any.required": "Amount is required"
    })
  });

  const withdrawSchema = Joi.object({
    amount: Joi.number().positive().required().messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be a positive number",
      "any.required": "Amount is required"
    })
  });

  module.exports = {    
    createAccountSchema,
    getAccountByIdSchema,
    updateAccountSchema,
    deleteAccountSchema,
    depositSchema,
    withdrawSchema
  }