const CTRL = {};
const sequelize = require("../../database/sequelize");
const ClientStatuReason = require("../../models/clients_statu_reasons/clients_statu_reasons.model");

const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, ClientStatuReason);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, ClientStatuReason, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    const include = [];
    Methods.getAll(req, res, next, ClientStatuReason, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, ClientStatuReason, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
