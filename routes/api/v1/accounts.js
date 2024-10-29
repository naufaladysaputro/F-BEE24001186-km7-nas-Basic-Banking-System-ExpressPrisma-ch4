const express = require("express");
const AccountsController = require("../../../controllers/accounts.controller");
const router = express.Router();
const authenticate = require("../../../middleware/auth");

const validate  = require("../../../middleware/validation");
const { createAccountSchema } = require("../../../middleware/joi.account.scema");
const { getAccountByIdSchema } = require("../../../middleware/joi.account.scema");
const { updateAccountSchema } = require("../../../middleware/joi.account.scema");
const { deleteAccountSchema } = require("../../../middleware/joi.account.scema");

const { depositSchema } = require("../../../middleware/joi.account.scema");
const { withdrawSchema } = require("../../../middleware/joi.account.scema");

router.get("/",  authenticate,AccountsController.getAllAccounts);
router.get("/:id",  authenticate,validate(getAccountByIdSchema, "params"), AccountsController.getAccountById);
router.post("/", authenticate,validate(createAccountSchema), AccountsController.createAccount);
router.put("/:id", authenticate,validate(updateAccountSchema), AccountsController.updateAccount);
router.delete("/:id", authenticate,validate(deleteAccountSchema, "params"), AccountsController.deleteAccount);

router.post('/:id/deposit', authenticate,validate(depositSchema), AccountsController.deposit);
router.post('/:id/withdraw', authenticate,validate(withdrawSchema), AccountsController.withdraw);

module.exports = router;
