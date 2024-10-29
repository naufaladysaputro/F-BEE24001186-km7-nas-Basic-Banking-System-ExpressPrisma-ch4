const express = require("express");
const TransactionController = require("../../../controllers/transactions.controller");
const router = express.Router();
const authenticate = require("../../../middleware/auth");

const validate  = require("../../../middleware/validation");
const { createTransactionSchema } = require("../../../middleware/joi.transaction.scema");
const { getTransactionByIdSchema } = require("../../../middleware/joi.transaction.scema");

router.post("/", authenticate, validate(createTransactionSchema), TransactionController.createTransaction);
router.get("/:id", authenticate,validate(getTransactionByIdSchema, "params"), TransactionController.getTransactionById);
router.get("/", authenticate,TransactionController.getAllTransactions);

// // Endpoint untuk deposit dan withdraw menggunakan PUT
// router.put('/deposit', TransactionController.deposit);
// router.put('/withdraw', TransactionController.withdraw);

module.exports = router;

