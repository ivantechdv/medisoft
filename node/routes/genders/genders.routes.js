const express = require("express");
const router = express.Router();
const Gender = require("../../controllers/genders/genders.controller");
/* const  authRequired = require('../../middleware/validateToken');*/

router.get("/", Gender.get);
router.get("/all", Gender.getAll);
router.get("/:id", Gender.getById);
router.post("/", Gender.create);
router.put("/:id", Gender.create);

module.exports = router;
