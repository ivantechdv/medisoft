const express = require("express");
const router = express.Router();
const Family = require("../../controllers/families/families.controller");
/* const  authRequired = require('../../middleware/validateToken');*/

router.get("/", Family.get);
router.get("/all", Family.getAll);
router.get("/getByClientId", Family.getByClientId);
router.get("/:id", Family.getById);
router.post("/", Family.create);
router.put("/:id", Family.update);
router.delete("/:id", Family.delete);

module.exports = router;
