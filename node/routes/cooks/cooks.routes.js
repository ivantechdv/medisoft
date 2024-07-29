const express = require("express");
const router = express.Router();
const Cook = require("../../controllers/cooks/cooks.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", Cook.get);
router.get("/all", Cook.getAll);
router.get("/:id", Cook.getById);
router.post("/", Cook.create);
router.put("/:id", Cook.create);
module.exports = router;
