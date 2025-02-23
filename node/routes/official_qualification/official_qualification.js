const express = require("express");
const router = express.Router();
const OfficialQualification = require("../../controllers/official_qualification/official_qualification");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", OfficialQualification.get);
router.get("/all", OfficialQualification.getAll);
router.get("/:id", OfficialQualification.getById);
router.post("/", OfficialQualification.create);
router.put("/:id", OfficialQualification.create);
module.exports = router;
