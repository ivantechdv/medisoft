const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const CodPost = require("../../models/cod_posts/cod_posts.model");
const Country = require("../../models/countries/countries.model");
const State = require("../../models/states/states.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, Country);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, Country, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    const include = [
      {
        model: State,
        include: [
          {
            model: CodPost,
          },
        ],
      },
    ];
    Methods.getAll(req, res, next, Country, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, Country, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.updatePhoneConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phone_format, phone_mask } = req.body;

    const country = await Country.findByPk(id);
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }

    await country.update({
      phone_format: phone_format || null,
      phone_mask: phone_mask || null
    });

    res.json(country);
  } catch (error) {
    console.log("Error updating country phone config:", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.getPhoneConfigByCountry = async (req, res, next) => {
  try {
    const { countryId } = req.params;

    const country = await Country.findByPk(countryId, {
      attributes: ['id', 'name', 'code_phone', 'phone_format', 'phone_mask']
    });

    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }

    res.json(country);
  } catch (error) {
    console.log("Error getting country phone config:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
