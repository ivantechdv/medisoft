const express = require("express");
const router = express.Router();
const ConceptsInvoices = require("../../controllers/concepts_invoices/concepts_invoices.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", ConceptsInvoices.get);
router.get("/all", ConceptsInvoices.getAll);
router.get("/:id", ConceptsInvoices.getById);
router.post("/", ConceptsInvoices.create);
router.put("/:id", ConceptsInvoices.create);
module.exports = router;
