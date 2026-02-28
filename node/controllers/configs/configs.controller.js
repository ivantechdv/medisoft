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

CTRL.getMask = async (req, res, next) => {
  try {
    // Primero buscar configuración activa
    let config = await Config.findOne({
      where: { is_active: true },
      attributes: ['phone_mask']
    });
    
    // Si no hay configuración activa, buscar cualquier configuración
    if (!config) {
      config = await Config.findOne({
        attributes: ['phone_mask']
      });
    }
    
    // Si todavía no hay configuración, crear una por defecto
    if (!config) {
      console.log('No se encontró configuración, creando una por defecto...');
      
      // Buscar un país por defecto (España o el primero que encuentre)
      const Country = require("../../models/countries/countries.model");
      let defaultCountry = await Country.findOne({ where: { name: 'España' } });
      
      if (!defaultCountry) {
        defaultCountry = await Country.findOne();
      }
      
      if (!defaultCountry) {
        console.error('No se encontró ningún país para usar como default_country_id');
        return res.json({ phoneMask: '999 99 99 99' });
      }
      
      const defaultConfig = await Config.create({
        phone_mask: '999 99 99 99',
        default_country_id: defaultCountry.id,
        is_active: true
      });
      return res.json({ phoneMask: defaultConfig.phone_mask });
    }
    
    res.json({ phoneMask: config.phone_mask || '999 99 99 99' });
  } catch (error) {
    console.error('Error al obtener máscara de teléfono:', error);
    res.json({ phoneMask: '999 99 99 99' }); // Máscara por defecto en caso de error
  }
};

module.exports = CTRL;
