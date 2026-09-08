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
      const createData = { ...req.body };

      if (createData.ui_config) {
        createData.client_config = mergeUiConfigIntoClientConfig(
          createData.client_config,
          createData.ui_config,
        );
        delete createData.ui_config;
      }

      const config = await Config.create(createData, { transaction });
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

const DEFAULT_UI_CONFIG = {
  fontFamily: 'Manrope',
  fontSize: '11px',
  labelColor: '#374151',
  titleColor: '#111827',
  panelTitleColor: '#274C8F',
  panelTextColor: '#334155',
  cardTitleSize: '13px',
  cardTitleColor: '#1f2937',
  cardTextSize: '12px',
  cardTextColor: '#4b5563',
  cardPadding: '8px',
  tableHeaderSize: '10px',
  tableHeaderColor: '#334155',
  tableCellSize: '10.5px',
  tableCellColor: '#1f2937',
  pageBackgroundColor: '#f1f4f8',
  pageBackgroundPattern: 'none',
  sidebarBackgroundColor: '#f8f9fb',
  topNavBackgroundColor: '#f6f8fb',
  sidebarFontFamily: 'Manrope',
  sidebarFontSize: '12px',
  sidebarTextColor: '#243447',
  toolbarFontFamily: 'Manrope',
  toolbarFontSize: '10.5px',
  toolbarTextColor: '#1f2937',
  toolbarBackgroundColor: '#ffffff',
};

const sanitizeUiConfig = (config) => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return null;
  }

  return {
    fontFamily: config.fontFamily || DEFAULT_UI_CONFIG.fontFamily,
    fontSize: config.fontSize || DEFAULT_UI_CONFIG.fontSize,
    labelColor: config.labelColor || DEFAULT_UI_CONFIG.labelColor,
    titleColor: config.titleColor || DEFAULT_UI_CONFIG.titleColor,
    panelTitleColor: config.panelTitleColor || DEFAULT_UI_CONFIG.panelTitleColor,
    panelTextColor: config.panelTextColor || DEFAULT_UI_CONFIG.panelTextColor,
    cardTitleSize: config.cardTitleSize || DEFAULT_UI_CONFIG.cardTitleSize,
    cardTitleColor: config.cardTitleColor || DEFAULT_UI_CONFIG.cardTitleColor,
    cardTextSize: config.cardTextSize || DEFAULT_UI_CONFIG.cardTextSize,
    cardTextColor: config.cardTextColor || DEFAULT_UI_CONFIG.cardTextColor,
    cardPadding: config.cardPadding || DEFAULT_UI_CONFIG.cardPadding,
    tableHeaderSize: config.tableHeaderSize || DEFAULT_UI_CONFIG.tableHeaderSize,
    tableHeaderColor: config.tableHeaderColor || DEFAULT_UI_CONFIG.tableHeaderColor,
    tableCellSize: config.tableCellSize || DEFAULT_UI_CONFIG.tableCellSize,
    tableCellColor: config.tableCellColor || DEFAULT_UI_CONFIG.tableCellColor,
    pageBackgroundColor:
      config.pageBackgroundColor || DEFAULT_UI_CONFIG.pageBackgroundColor,
    pageBackgroundPattern:
      config.pageBackgroundPattern || DEFAULT_UI_CONFIG.pageBackgroundPattern,
    sidebarBackgroundColor:
      config.sidebarBackgroundColor || DEFAULT_UI_CONFIG.sidebarBackgroundColor,
    topNavBackgroundColor:
      config.topNavBackgroundColor || DEFAULT_UI_CONFIG.topNavBackgroundColor,
    sidebarFontFamily:
      config.sidebarFontFamily || DEFAULT_UI_CONFIG.sidebarFontFamily,
    sidebarFontSize:
      config.sidebarFontSize || DEFAULT_UI_CONFIG.sidebarFontSize,
    sidebarTextColor:
      config.sidebarTextColor || DEFAULT_UI_CONFIG.sidebarTextColor,
    toolbarFontFamily:
      config.toolbarFontFamily || DEFAULT_UI_CONFIG.toolbarFontFamily,
    toolbarFontSize:
      config.toolbarFontSize || DEFAULT_UI_CONFIG.toolbarFontSize,
    toolbarTextColor:
      config.toolbarTextColor || DEFAULT_UI_CONFIG.toolbarTextColor,
    toolbarBackgroundColor:
      config.toolbarBackgroundColor || DEFAULT_UI_CONFIG.toolbarBackgroundColor,
  };
};

const extractUiConfig = (clientConfig = {}) =>
  sanitizeUiConfig(clientConfig.ui_config) || { ...DEFAULT_UI_CONFIG };

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

  if (Object.prototype.hasOwnProperty.call(config, 'ui_config')) {
    const uiConfig = sanitizeUiConfig(config.ui_config);
    if (uiConfig) {
      sanitized.ui_config = uiConfig;
    }
  }

  return sanitized;
};

const mergeUiConfigIntoClientConfig = (clientConfig = {}, uiConfig = {}) => {
  const sanitizedClientConfig = sanitizeClientConfig(parseConfigSection(clientConfig));
  const sanitizedUiConfig = sanitizeUiConfig(parseConfigSection(uiConfig));

  if (!sanitizedUiConfig) {
    return sanitizedClientConfig;
  }

  return {
    ...sanitizedClientConfig,
    ui_config: {
      ...extractUiConfig(sanitizedClientConfig),
      ...sanitizedUiConfig,
    },
  };
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
  const clientConfig = sanitizeClientConfig(parseConfigSection(plainConfig.client_config));

  return {
    ...plainConfig,
    client_config: clientConfig,
    employee_config: parseConfigSection(plainConfig.employee_config),
    ui_config: extractUiConfig(clientConfig),
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
      if (req.body.ui_config) {
        const baseClientConfig = updateData.client_config
          ? updateData.client_config
          : sanitizeClientConfig(parseConfigSection(config.client_config));

        updateData.client_config = mergeUiConfigIntoClientConfig(
          baseClientConfig,
          req.body.ui_config,
        );
        delete updateData.ui_config;
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
