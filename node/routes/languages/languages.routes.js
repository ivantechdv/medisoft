const express = require("express");
const router = express.Router();
const Language = require("../../controllers/languages/languages.controller");
/* const  authRequired = require('../../middleware/validateToken');*/

router.get("/", Language.get);
router.get("/all", Language.getAll);
router.get("/:id", Language.getById);
router.post("/", Language.create);
router.put("/:id", Language.create);

module.exports = router;
