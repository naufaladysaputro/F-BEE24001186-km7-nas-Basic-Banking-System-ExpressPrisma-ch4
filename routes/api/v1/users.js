const express = require("express");
const userController = require("../../../controllers/users.controller"); 
const router = express.Router();
const validate  = require("../../../middleware/validation");
const { createUserSchema } = require("../../../middleware/joi.scema");


router.get("/", userController.getAllUser);
router.get("/:id", userController.getUserById);
router.post("/", validate(createUserSchema),userController.createUserWithProfile);
router.put("/:id", userController.updateUsersWithProfile);
router.delete("/:id", userController.deleteUsersById);

module.exports = router;
