const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const ClientsServices = require("../../models/clients_services/clients_services.model");
const ClientsServicesPreselections = require("../../models/clients_services_preselections/clients_services_preselections.model");
const Employee = require("../../models/employees/employees.model");
const Service = require("../../models/services/services.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, ClientsServicesPreselections);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.update = async (req, res, next) => {
  try {
    await Methods.update(req, res, next, ClientsServicesPreselections);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error });
  }
};

CTRL.createBulk = async (req, res, next) => {
  try {
    Methods.createOrUpdateBulk(req.body, ClientsServicesPreselections);
    return res.status(200).json(true);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, ClientsServicesPreselections, condition);
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
      {
        model: Client,
      },
      {
        model: ClientsServices,
      },
    ];
    Methods.getAll(
      req,
      res,
      next,
      ClientsServicesPreselections,
      condition,
      include
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, ClientsServicesPreselections, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
