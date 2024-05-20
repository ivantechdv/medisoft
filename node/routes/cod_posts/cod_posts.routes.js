const express = require("express");
const router = express.Router();
const CodPost = require("../../controllers/cod_posts/cod_posts.controller");
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */

router.get("/", CodPost.get);
router.get("/all", CodPost.getAll);
router.get("/:id", CodPost.getById);
router.post("/", CodPost.create);
router.put("/:id", CodPost.create);
module.exports = router;
