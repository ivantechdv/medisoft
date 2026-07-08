const CTRL = {};
const EmployeeReference = require("../../models/employees/reference.model");
const Methods = require("../methods/methods.controller");
const { validateEmployeeReference } = require("../../utils/validators");

const respondValidationErrors = (res, errors) =>
  res.status(400).json({ error: errors.join(". ") });

CTRL.create = async (req, res, next) => {
  try {
    const errors = validateEmployeeReference(req.body);
    if (errors.length) {
      return respondValidationErrors(res, errors);
    }

    Methods.create(req, res, next, EmployeeReference);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await EmployeeReference.findByPk(id);

    if (!existing) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    const mergedData = { ...existing.toJSON(), ...req.body };
    const errors = validateEmployeeReference(mergedData);
    if (errors.length) {
      return respondValidationErrors(res, errors);
    }

    await Methods.update(req, res, next, EmployeeReference);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, EmployeeReference, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    const include = null;
    Methods.getAll(req, res, next, EmployeeReference, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    const include = [];
    Methods.getById(req, res, next, EmployeeReference, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
