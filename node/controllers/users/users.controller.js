const CTRL = {};
const sequelize = require("../../database/sequelize");
const User = require("../../models/users/users.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, User);
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};

CTRL.get = async (req, res, next) => {
  try {
    Methods.get(req, res, next, User);
  } catch (error) {
    next(error);
  }
};

module.exports = CTRL;
