const express = require("express");
const router = express.Router();
const ClientTasks = require("../../controllers/clients_tasks/clients_tasks.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", ClientTasks.get);
router.get("/all", ClientTasks.getAll);
router.get("/:id", ClientTasks.getById);
router.post("/", ClientTasks.create);
router.put("/:id", ClientTasks.create);
module.exports = router;
