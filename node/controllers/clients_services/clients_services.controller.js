const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const ClientsServices = require("../../models/clients_services/clients_services.model");
const Employee = require("../../models/employees/employees.model");
const Service = require("../../models/services/services.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, ClientsServices);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.update = async (req, res, next) => {
  try {
    await Methods.update(req, res, next, ClientsServices);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, ClientsServices, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    const include = [
      {
        model: Service,
      },
      {
        model: Employee,
      },
    ];
    Methods.getAll(req, res, next, ClientsServices, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, ClientsServices, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
