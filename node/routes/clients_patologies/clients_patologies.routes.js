const express = require("express");
const router = express.Router();
const ClientPatology = require("../../controllers/clients_patologies/clients_patologies.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", ClientPatology.get);
router.get("/all", ClientPatology.getAll);
router.get("/:id", ClientPatology.getById);
router.post("/", ClientPatology.create);
router.put("/:id", ClientPatology.create);
module.exports = router;
