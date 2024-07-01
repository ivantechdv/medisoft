const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const ClientsInvoices = require("../../models/clients_invoices/clients_invoices.model");
const ClientsServices = require("../../models/clients_services/clients_services.model");
const ClientStatuReason = require("../../models/clients_statu_reasons/clients_statu_reasons.model");
const ConceptsInvoices = require("../../models/concepts_invoices/concepts_invoices.model");
const Service = require("../../models/services/services.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, ClientsInvoices);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.update = async (req, res, next) => {
  try {
    await Methods.update(req, res, next, ClientsInvoices);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, ClientsInvoices, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    const include = [
      { model: ConceptsInvoices },
      { model: ClientsServices, include: [{ model: Service }] },
    ];
    Methods.getAll(req, res, next, ClientsInvoices, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, ClientsInvoices, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
