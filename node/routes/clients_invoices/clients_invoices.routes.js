const express = require("express");
const router = express.Router();
const ClientInvoice = require("../../controllers/clients_invoices/clients_invoices.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", ClientInvoice.get);
router.get("/all", ClientInvoice.getAll);
router.get("/:id", ClientInvoice.getById);
router.post("/", ClientInvoice.create);
router.put("/:id", ClientInvoice.update);
module.exports = router;
//
