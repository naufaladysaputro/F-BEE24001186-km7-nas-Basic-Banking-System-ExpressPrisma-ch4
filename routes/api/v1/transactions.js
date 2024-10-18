const express = require("express");
const TransactionController = require("../../../controllers/transactions.controller");
const router = express.Router();

router.post("/", TransactionController.createTransaction);
router.get("/:id", TransactionController.getTransactionById);
router.get("/", TransactionController.getAllTransactions);

// Endpoint untuk deposit dan withdraw menggunakan PUT
router.put('/deposit', TransactionController.deposit);
router.put('/withdraw', TransactionController.withdraw);

module.exports = router;

