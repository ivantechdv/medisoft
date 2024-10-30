const express = require("express");
const router = express.Router();
const Origen = require("../../controllers/origen/origen.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", Origen.get);
router.get("/all", Origen.getAll);
router.get("/:id", Origen.getById);
router.post("/", Origen.create);
router.put("/:id", Origen.create);
module.exports = router;
