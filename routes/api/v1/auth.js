const express = require("express");
const authController = require("../../../controllers/auth.controller");
const router = express.Router();

const validate  = require("../../../middleware/validation");
const { registerSchema } = require("../../../middleware/joi.auth.scema");
const { loginSchema } = require("../../../middleware/joi.auth.scema");  



router.post("/register", validate(registerSchema),authController.register);
router.post("/login", validate(loginSchema),authController.login);
router.get("/profile", authController.getProfile);

module.exports = router;