const express = require("express");
const router = express.Router();
const EducationalLevel = require("../../controllers/educational_level/educational_level.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", EducationalLevel.get);
router.get("/all", EducationalLevel.getAll);
router.get("/:id", EducationalLevel.getById);
router.post("/", EducationalLevel.create);
router.put("/:id", EducationalLevel.create);
module.exports = router;
