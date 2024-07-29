const CTRL = {};
const sequelize = require("../../database/sequelize");
const User = require("../../models/users/users.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, User);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    Methods.get(req, res, next, User);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    const include = [];
    await Methods.getById(req, res, next, Client, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};

    const include = [];

    await Methods.getAll(req, res, next, Client, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.update = async (req, res, next) => {
  try {
    await Methods.update(req, res, next, Client);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = CTRL;
