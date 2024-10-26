const express = require("express");
const userController = require("../../../controllers/users.controller"); 
const router = express.Router();
const authenticate = require("../../../middleware/auth");

const validate  = require("../../../middleware/validation");
const { createUserSchema } = require("../../../middleware/joi.user.scema");
const { getUserByIdSchema } = require("../../../middleware/joi.user.scema");
const { updateUserSchema } = require("../../../middleware/joi.user.scema");
const { deleteUsersByIdSchema } = require("../../../middleware/joi.user.scema");

router.get("/", authenticate, userController.getAllUser);
router.get("/:id", validate(getUserByIdSchema),userController.getUserById);
router.post("/", validate(createUserSchema),userController.createUserWithProfile);
router.put("/:id", validate(updateUserSchema), userController.updateUsersWithProfile);
router.delete("/:id", validate(deleteUsersByIdSchema),userController.deleteUsersById);

module.exports = router;
