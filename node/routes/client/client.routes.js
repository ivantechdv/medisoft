const express = require("express");
const router = express.Router();
const Client = require("../../controllers/clients/clients.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", Client.get);
router.get("/:id", Client.getById);

router.post("/", Client.create);
router.put("/:id", Client.update);

module.exports = router;
