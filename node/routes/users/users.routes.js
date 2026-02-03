const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/users/users.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", UserController.get);
router.get("/all", UserController.getAll);
router.get("/:id", UserController.getById);

router.post("/", UserController.create);
router.put("/:id", UserController.update);
router.post("/login", UserController.login);
router.post("/changeStatus", UserController.changeStatus);
// Envío de correo de invitación para establecer contraseña
router.post("/:id/send-password-email", UserController.sendPasswordEmail);
// Validación de token y establecimiento de contraseña
router.post("/validate-invite", UserController.validateInvite);
router.post("/set-password", UserController.setPassword);

module.exports = router;
