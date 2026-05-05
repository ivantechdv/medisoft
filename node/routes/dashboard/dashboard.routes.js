const express = require("express");
const router = express.Router();
const DashboardController = require("../../controllers/dashboard/dashboard.controller");

router.get("/stats", DashboardController.getDashboardStats);

module.exports = router;
