const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/users/users.controller');
/* const  authRequired = require('../../middleware/validateToken');
const validateSchema = require('../../middleware/validator.middleware'); */


router.get('/' ,  UserController.get);


module.exports = router;