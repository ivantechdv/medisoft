const express = require("express");
const router = express.Router();
const EventLogs = require("../../controllers/eventlogs/eventlogs.controller");
const authRequired = require("../../middleware/validateToken");

router.post("/", EventLogs.create);
router.get("/:module/:id", EventLogs.get);

module.exports = router;
