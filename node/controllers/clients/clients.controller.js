const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const ClientPatology = require("../../models/clients_patologies/clients_patologies.model");
const CodPost = require("../../models/cod_posts/cod_posts.model");
const Patology = require("../../models/patologies/patologies.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, Client);
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};

CTRL.update = async (req, res, next) => {
  try {
    Methods.update(req, res, next, Client);
  } catch (error) {
    console.log("error", error);
    next(error);
  }
};
CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    const include = [
      {
        model: CodPost,
      },
      {
        model: ClientPatology,
      },
    ];
    Methods.get(req, res, next, Client, condition, include);
  } catch (error) {
    next(error);
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    const include = [
      {
        model: CodPost,
      },
      {
        model: ClientPatology,
        include: [
          {
            model: Patology,
          },
        ],
      },
    ];
    Methods.getById(req, res, next, Client, condition, include);
  } catch (error) {
    next(error);
  }
};

module.exports = CTRL;
