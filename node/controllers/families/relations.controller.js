const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const Family = require("../../models/families/families.mode");
const Relation = require("../../models/families/relations.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, Relation);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};
CTRL.update = async (req, res, next) => {
  try {
    const updated = await Methods.update(req, res, next, Relation);
  } catch (error) {
    res.json({ statusCode: 500, error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, Relation, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    // const include = {
    //   model: Client,
    // };
    const include = null;
    Methods.getAll(req, res, next, Relation, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, Relation, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.delete = async (req, res, next) => {
  try {
    await Methods.delete(req, res, next, Relation);
  } catch (error) {
    res.json({ statusCode: 500, error: error.message });
  }
};
module.exports = CTRL;
