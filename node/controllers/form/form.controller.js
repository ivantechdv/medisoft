const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const CodPost = require("../../models/cod_posts/cod_posts.model");
const Cook = require("../../models/cooks/cooks.model");
const State = require("../../models/states/states.model");
const Employee = require("../../models/employees/employees.model");
const Methods = require("../methods/methods.controller");
const validationField = require("../../utils/validators");
CTRL.create = async (req, res, next) => {
  try {
    const model = req.params.model;
    if (model == Employee) {
      const duplicated = await validationField(
        Employee,
        {
          dni: req.body.dni,
          email: req.body.email,
          phone: req.body.phone,
          code_phone: req.body.code_phone,
          full_name: req.body.full_name,
          num_social_security: req.body.num_social_security,
        },
        null,
        ["code_phone", "phone"]
      );

      if (duplicated) {
        return res.status(409).json({
          error: `Ya existe un cuidador con los siguientes campos duplicados: ${duplicated.join(
            ", "
          )}`,
        });
      }
    }
    Methods.create(req, res, next, model);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const model = req.params.model;
    console.log("model", model);
    const condition = {};
    Methods.getAll(req, res, next, model, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getByProvincia = async (req, res, next) => {
  try {
    const provinciaId = req.params.provincia_id;
    const model = req.params.model;
    if (!provinciaId || isNaN(provinciaId)) {
      return res.status(400).json({ error: "ID de provincia inválido" });
    }
    const condition = {
      state_id: provinciaId,
    };
    Methods.getAll(req, res, next, model, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    const include = [];
    Methods.getAll(req, res, next, Cook, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, Cook, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
