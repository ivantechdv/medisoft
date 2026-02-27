const CTRL = {};
const sequelize = require("../../database/sequelize");
const Config = require("../../models/configs/configs.model");
const Country = require("../../models/countries/countries.model");
const State = require("../../models/states/states.model");
const Language = require("../../models/languages/languages.model");
const Level = require("../../models/employees/level.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    const transaction = await sequelize.transaction();
    
    try {
      const config = await Config.create(req.body, { transaction });
      await transaction.commit();
      
      res.status(201).json(config);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.log("Error creating config:", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = { is_active: true };
    const include = [
      {
        model: Country,
        as: 'defaultCountry',
        attributes: ['id', 'name', 'code_phone']
      }
    ];
    
    const config = await Config.findOne({
      where: condition,
      include
    });
    
    if (!config) {
      return res.status(404).json({ error: "No active configuration found" });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    const include = [
      {
        model: Country,
        as: 'defaultCountry',
        attributes: ['id', 'name', 'code_phone']
      }
    ];
    
    Methods.getAll(req, res, next, Config, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    const include = [
      {
        model: Country,
        as: 'defaultCountry',
        attributes: ['id', 'name', 'code_phone']
      }
    ];
    
    Methods.getById(req, res, next, Config, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.update = async (req, res, next) => {
  try {
    const transaction = await sequelize.transaction();
    
    try {
      const config = await Config.findByPk(req.params.id, { transaction });
      
      if (!config) {
        await transaction.rollback();
        return res.status(404).json({ error: "Configuration not found" });
      }
      
      await config.update(req.body, { transaction });
      await transaction.commit();
      
      res.json(config);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.log("Error updating config:", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.getCountries = async (req, res, next) => {
  try {
    const countries = await Country.findAll({
      attributes: ['id', 'name', 'code_phone'],
      order: [['name', 'ASC']]
    });
    
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getStatesByCountry = async (req, res, next) => {
  try {
    const { countryId } = req.params;
    
    const states = await State.findAll({
      where: { country_id: countryId },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getLanguages = async (req, res, next) => {
  try {
    const languages = await Language.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getLevels = async (req, res, next) => {
  try {
    const levels = await Level.findAll({
      attributes: ['id', 'name', 'color'],
      order: [['name', 'ASC']]
    });
    
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
