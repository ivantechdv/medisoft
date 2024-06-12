const express = require("express");
const router = express.Router();
const ClientService = require("../../controllers/clients_services/clients_services.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", ClientService.get);
router.get("/all", ClientService.getAll);
router.get("/:id", ClientService.getById);
router.post("/", ClientService.create);
router.put("/:id", ClientService.update);
module.exports = router;
//
