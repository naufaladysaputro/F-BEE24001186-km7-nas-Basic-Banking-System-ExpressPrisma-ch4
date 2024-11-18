const express = require("express");
const mailerController = require("../../../controllers/mailer.controller");

const router = express.Router();

router.post("/send", mailerController.sendMail);

module.exports = router;
