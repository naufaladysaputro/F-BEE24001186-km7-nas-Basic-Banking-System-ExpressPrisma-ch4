var express = require("express");
var router = express.Router();
const USER_ROUTER = require("./users");

router.use("/users", USER_ROUTER);

module.exports = router;
