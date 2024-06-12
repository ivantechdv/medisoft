const express = require("express");
const router = express.Router();
const ClientService = require("../../controllers/clients_services_preselections/clients_services_preselections.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", ClientService.get);
router.get("/all", ClientService.getAll);
router.get("/:id", ClientService.getById);
router.post("/", ClientService.create);
router.post("/bulk", ClientService.createBulk);
router.put("/:id", ClientService.create);
module.exports = router;
//
