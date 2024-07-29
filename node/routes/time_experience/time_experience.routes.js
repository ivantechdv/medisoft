const express = require("express");
const router = express.Router();
const timeExperience = require("../../controllers/time_experience/time_experience.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", timeExperience.get);
router.get("/all", timeExperience.getAll);
router.get("/:id", timeExperience.getById);
router.post("/", timeExperience.create);
router.put("/:id", timeExperience.create);
module.exports = router;
