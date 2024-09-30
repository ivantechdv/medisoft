const express = require("express");
const router = express.Router();
const Employee = require("../../controllers/employees/employees.controller");
const Complementary = require("../../controllers/employees/complementary.controller");
const Task = require("../../controllers/employees/task.controller");
const GainExperience = require("../../controllers/employees/gain_experience.controller");
const Specific = require("../../controllers/employees/specific.controller");
const Reference = require("../../controllers/employees/reference.controller");
const Filter = require("../../controllers/employees/filter.controller");
const Status = require("../../controllers/employees/status.controller");

const Level = require("../../controllers/employees/level.controller");

/* const  authRequired = require('../../middleware/validateToken');*/
router.post("/reference", Reference.create);
router.get("/reference/all", Reference.getAll);
router.put("/reference/:id", Reference.update);

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

router.post("/level", Level.create);
router.get("/level/all", Level.getAll);

router.post("/status", Status.create);
router.get("/status/all", Status.getAll);
router.put("/status/:id", Status.update);

router.post("/filter", Filter.create);
router.get("/filter/all", Filter.getAll);
router.put("/filter/:id", Filter.update);

router.get("/", Employee.get);
router.get("/all", Employee.getAll);
router.get("/getBySearch", Employee.getBySearch);
router.get("/:id", Employee.getById);
router.post("/", Employee.create);
router.put("/:id", Employee.update);

module.exports = router;
