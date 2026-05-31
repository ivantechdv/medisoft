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
      
      res.status(201).json(formatConfigResponse(config));
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
      },
      {
        model: State,
        as: 'defaultState',
        attributes: ['id', 'name']
      }
    ];

    const config = await Config.findOne({
      where: condition,
      include
    });

    if (!config) {
      return res.status(404).json({ error: "No active configuration found" });
    }

    res.json(formatConfigResponse(config));
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

const NUMERIC_KEY_REGEX = /^\d+$/;

const sanitizeClientConfig = (config) => {
  if (!config || typeof config !== 'object') return {};

  const sanitized = {};
  if (Object.prototype.hasOwnProperty.call(config, 'default_type')) {
    const value = config.default_type;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      sanitized.default_type = trimmed.length ? trimmed : null;
    } else if (value === null) {
      sanitized.default_type = null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(config, 'default_languages')) {
    const value = config.default_languages;
    let languages = [];

    if (Array.isArray(value)) {
      languages = value
        .map((lang) => Number(lang))
        .filter((lang) => !Number.isNaN(lang));
    } else if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) {
        languages = trimmed
          .split(',')
          .map((lang) => Number(lang.trim()))
          .filter((lang) => !Number.isNaN(lang));
      }
    }

    sanitized.default_languages = languages;
  }

  // Permitir default_state_id
  if (Object.prototype.hasOwnProperty.call(config, 'default_state_id')) {
    const value = config.default_state_id;
    sanitized.default_state_id = value ? Number(value) : null;
  }

  // Permitir default_country_code
  if (Object.prototype.hasOwnProperty.call(config, 'default_country_code')) {
    const value = config.default_country_code;
    sanitized.default_country_code = typeof value === 'string' ? value.trim() : '';
  }

  return sanitized;
};

const parseConfigSection = (section) => {
  if (!section) return {};

  if (typeof section === 'string') {
    const trimmed = section.trim();

    if (!trimmed.length) return {};

    const looksLikeJson =
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'));

    if (!looksLikeJson) {
      return {};
    }

    try {
      const parsed = JSON.parse(trimmed);
      return parseConfigSection(parsed);
    } catch (error) {
      console.warn('No se pudo parsear configuración JSON:', section, error);
      return {};
    }
  }

  if (Array.isArray(section)) {
    return section;
  }

  if (typeof section === 'object') {
    const keys = Object.keys(section);
    if (keys.length === 0) return {};

    const nonNumericEntries = Object.entries(section).filter(
      ([key]) => !NUMERIC_KEY_REGEX.test(key),
    );

    if (nonNumericEntries.length) {
      return nonNumericEntries.reduce((acc, [key, value]) => {
        if (value === undefined || value === null) return acc;

        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          const looksLikeJsonValue =
            (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) ||
            (trimmedValue.startsWith('[') && trimmedValue.endsWith(']'));

          if (looksLikeJsonValue) {
            const parsedValue = parseConfigSection(value);
            if (
              (Array.isArray(parsedValue) && parsedValue.length) ||
              (typeof parsedValue === 'object' && Object.keys(parsedValue).length)
            ) {
              acc[key] = parsedValue;
            } else {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
        } else if (Array.isArray(value)) {
          acc[key] = value;
        } else if (typeof value === 'object') {
          const parsedNested = parseConfigSection(value);
          acc[key] = parsedNested;
        } else {
          acc[key] = value;
        }

        return acc;
      }, {});
    }

    try {
      const sortedKeys = keys.slice().sort((a, b) => Number(a) - Number(b));
      const reconstructed = sortedKeys.map((key) => section[key]).join('');
      const trimmedReconstructed = reconstructed.trim();

      if (!trimmedReconstructed.length) {
        return {};
      }

      const looksLikeJson =
        (trimmedReconstructed.startsWith('{') && trimmedReconstructed.endsWith('}')) ||
        (trimmedReconstructed.startsWith('[') && trimmedReconstructed.endsWith(']'));

      if (!looksLikeJson) {
        return {};
      }

      const reparsed = JSON.parse(trimmedReconstructed);

      if (
        typeof reparsed === 'object' &&
        reparsed !== null &&
        !Array.isArray(reparsed)
      ) {
        const reparsedKeys = Object.keys(reparsed);
        const isSameNumericShape =
          reparsedKeys.length === sortedKeys.length &&
          reparsedKeys.every((key, index) => key === sortedKeys[index] && NUMERIC_KEY_REGEX.test(key));

        if (isSameNumericShape) {
          return {};
        }
      }

      return parseConfigSection(reparsed);
    } catch (error) {
      console.warn('No se pudo reconstruir configuración corrupta:', error);
      return {};
    }
  }

  return {};
};

const formatConfigResponse = (config) => {
  if (!config) return config;

  const plainConfig = typeof config.toJSON === 'function' ? config.toJSON() : config;

  return {
    ...plainConfig,
    client_config: sanitizeClientConfig(parseConfigSection(plainConfig.client_config)),
    employee_config: parseConfigSection(plainConfig.employee_config),
  };
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
      
      // Merge client_config and employee_config if provided
      const updateData = { ...req.body };

      if (req.body.client_config) {
        const storedClientConfig = sanitizeClientConfig(
          parseConfigSection(config.client_config),
        );
        const incomingClientConfig = sanitizeClientConfig(
          parseConfigSection(req.body.client_config),
        );

        updateData.client_config = {
          ...storedClientConfig,
          ...incomingClientConfig,
        };
      }
      if (req.body.employee_config) {
        const storedEmployeeConfig = parseConfigSection(config.employee_config);
        const incomingEmployeeConfig = parseConfigSection(req.body.employee_config);

        updateData.employee_config = {
          ...storedEmployeeConfig,
          ...incomingEmployeeConfig,
        };
      }

      await config.update(updateData, { transaction });
      await transaction.commit();

      res.json(formatConfigResponse(config));
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

CTRL.getCountriesPhoneConfigs = async (req, res, next) => {
  try {
    const countries = await Country.findAll({
      attributes: ['id', 'name', 'code_phone', 'phone_format', 'phone_mask'],
      order: [['name', 'ASC']]
    });

    res.json(countries);
  } catch (error) {
    console.error('Error al obtener configuraciones de teléfono por país:', error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.updateCountryPhoneConfig = async (req, res, next) => {
  try {
    const { countryId } = req.params;
    const { phone_format, phone_mask } = req.body;

    const country = await Country.findByPk(countryId);
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }

    await country.update({
      phone_format: phone_format || null,
      phone_mask: phone_mask || null
    });

    res.json(country);
  } catch (error) {
    console.error('Error al actualizar configuración de teléfono por país:', error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.deleteCountryPhoneConfig = async (req, res, next) => {
  try {
    const { countryId } = req.params;

    const country = await Country.findByPk(countryId);
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }

    await country.update({
      phone_format: null,
      phone_mask: null
    });

    res.json({ message: "Phone configuration deleted successfully" });
  } catch (error) {
    console.error('Error al eliminar configuración de teléfono por país:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
