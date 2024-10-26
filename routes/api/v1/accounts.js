const express = require("express");
const AccountsController = require("../../../controllers/accounts.controller");
const router = express.Router();

const validate  = require("../../../middleware/validation");
const { createAccountSchema } = require("../../../middleware/joi.account.scema");
const { getAccountByIdSchema } = require("../../../middleware/joi.account.scema");
const { updateAccountSchema } = require("../../../middleware/joi.account.scema");
const { deleteAccountSchema } = require("../../../middleware/joi.account.scema");

const { depositSchema } = require("../../../middleware/joi.account.scema");
const { withdrawSchema } = require("../../../middleware/joi.account.scema");

router.get("/",  AccountsController.getAllAccounts);
router.get("/:id",  validate(getAccountByIdSchema), AccountsController.getAccountById);
router.post("/", validate(createAccountSchema), AccountsController.createAccount);
router.put("/:id", validate(updateAccountSchema), AccountsController.updateAccount);
router.delete("/:id", validate(deleteAccountSchema), AccountsController.deleteAccount);

router.post('/:id/deposit', validate(depositSchema), AccountsController.deposit);
router.put('/:id/withdraw', validate(withdrawSchema), AccountsController.withdraw);

module.exports = router;
