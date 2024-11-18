const express = require("express");
const authV2Controller = require("../../../controllers/authv2.controller");
const validate = require("../../../middleware/validation");
const { registerSchema, loginSchema, resetPasswordSchema } = require("../../../middleware/joi.authv2.scema");

const router = express.Router();

router.post("/register", validate(registerSchema),  authV2Controller.register);
router.post("/login", validate(loginSchema), authV2Controller.login);
router.post("/reset-password", validate(resetPasswordSchema), authV2Controller.resetPassword);
router.post("/send-reset-password-email", authV2Controller.sendResetPasswordEmail);

module.exports = router;
