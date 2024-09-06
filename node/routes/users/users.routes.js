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
module.exports = router;
