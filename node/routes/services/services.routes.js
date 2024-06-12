const express = require("express");
const router = express.Router();
const Service = require("../../controllers/services/services.controller");
/* const  authRequired = require('../../middleware/validateToken');*/

router.get("/", Service.get);
router.get("/all", Service.getAll);
router.get("/:id", Service.getById);
router.post("/", Service.create);
router.put("/:id", Service.create);

module.exports = router;
