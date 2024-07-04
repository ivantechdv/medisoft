const express = require("express");
const router = express.Router();
const FollowUps = require("../../controllers/clients_follow_ups/clients_follow_ups.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", FollowUps.get);
router.get("/all", FollowUps.getAll);
router.get("/:id", FollowUps.getById);
router.post("/", FollowUps.create);
router.put("/:id", FollowUps.create);
module.exports = router;
