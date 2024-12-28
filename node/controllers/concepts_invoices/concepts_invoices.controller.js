const CTRL = {};
const sequelize = require("../../database/sequelize");
const ConceptsInvoices = require("../../models/concepts_invoices/concepts_invoices.model");
const PaymentPeriod = require("../../models/payment_period/payment_period.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, ConceptsInvoices);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.update = async (req, res, next) => {
  try {
    await Methods.update(req, res, next, ConceptsInvoices);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, ConceptsInvoices, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    const include = [{ model: PaymentPeriod }];
    Methods.getAll(req, res, next, ConceptsInvoices, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    const include = [{ model: PaymentPeriod }];
    Methods.getById(req, res, next, ConceptsInvoices, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
