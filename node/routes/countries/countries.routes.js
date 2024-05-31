const express = require("express");
const router = express.Router();
const Country = require("../../controllers/countries/countries.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", Country.get);
router.get("/all", Country.getAll);
router.get("/:id", Country.getById);
router.post("/", Country.create);
router.put("/:id", Country.create);
module.exports = router;
