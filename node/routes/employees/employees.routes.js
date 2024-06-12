const express = require("express");
const router = express.Router();
const Employee = require("../../controllers/employees/employees.controller");
/* const  authRequired = require('../../middleware/validateToken');*/

router.get("/", Employee.get);
router.get("/all", Employee.getAll);
router.get("/:id", Employee.getById);
router.post("/", Employee.create);
router.put("/:id", Employee.create);

module.exports = router;
