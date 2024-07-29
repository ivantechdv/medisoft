const express = require("express");
const router = express.Router();
const Employee = require("../../controllers/employees/employees.controller");
const Complementary = require("../../controllers/employees/complementary.controller");
const Task = require("../../controllers/employees/task.controller");
const GainExperience = require("../../controllers/employees/gain_experience.controller");
const Specific = require("../../controllers/employees/specific.controller");

/* const  authRequired = require('../../middleware/validateToken');*/

router.post("/specific", Specific.create);
router.get("/specific/all", Specific.getAll);
router.put("/specific/:id", Specific.update);

router.post("/complementary", Complementary.create);
router.get("/complementary/all", Complementary.getAll);
router.put("/complementary/:id", Complementary.update);

router.post("/gain-experience", GainExperience.create);
router.get("/gain-experience/all", GainExperience.getAll);
router.put("/gain-experience/:id", GainExperience.update);

router.post("/task", Task.create);
router.get("/task/all", Task.getAll);
router.put("/task/:id", Task.update);

router.get("/", Employee.get);
router.get("/all", Employee.getAll);
router.get("/:id", Employee.getById);
router.post("/", Employee.create);
router.put("/:id", Employee.update);

module.exports = router;
