const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const Patology = require("../../models/patologies/patologies.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, Patology);
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, Patology, condition);
  } catch (error) {
    next(error);
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    // const include = {
    //   model: Client,
    // };
    const include = null;
    Methods.getAll(req, res, next, Patology, condition, include);
  } catch (error) {
    next(error);
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, Patology, condition);
  } catch (error) {
    next(error);
  }
};

module.exports = CTRL;
