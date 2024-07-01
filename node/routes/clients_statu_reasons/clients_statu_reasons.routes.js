const express = require("express");
const router = express.Router();
const ClientStatuReason = require("../../controllers/clients_statu_reasons/clients_statu_reasons.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", ClientStatuReason.get);
router.get("/all", ClientStatuReason.getAll);
router.get("/:id", ClientStatuReason.getById);
router.post("/", ClientStatuReason.create);
router.put("/:id", ClientStatuReason.create);
module.exports = router;
