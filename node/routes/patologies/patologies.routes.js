const express = require("express");
const router = express.Router();
const Patology = require("../../controllers/patologies/patologies.controller");
/* const  authRequired = require('../../middleware/validateToken');*/

router.get("/", Patology.get);
router.get("/all", Patology.getAll);
router.get("/:id", Patology.getById);
router.post("/", Patology.create);
router.put("/:id", Patology.update);
router.post("/changeStatus", Patology.changeStatus);

module.exports = router;
