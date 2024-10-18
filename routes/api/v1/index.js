var express = require("express");
var router = express.Router();
const USER_ROUTER = require("./users");
const ACCOUNT_ROUTER = require("./accounts");
const TRANSACTION_ROUTER = require("./transactions");

router.use("/users", USER_ROUTER);
router.use("/accounts", ACCOUNT_ROUTER);
router.use("/transactions", TRANSACTION_ROUTER);

module.exports = router;
