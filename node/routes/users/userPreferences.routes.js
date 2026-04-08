const express = require("express");
const router = express.Router();
const UserPreferencesController = require("../../controllers/users/userPreferences.controller");
const authRequired = require("../../middleware/validateToken");

router.get("/", authRequired, UserPreferencesController.getPreferences);
router.post("/", authRequired, UserPreferencesController.upsertPreferences);
router.delete("/:entity", authRequired, UserPreferencesController.deletePreferences);

module.exports = router;
