const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const ClientPatology = require("../../models/clients_patologies/clients_patologies.model");
const ClientTask = require("../../models/clients_tasks/clients_tasks.model");

const CodPost = require("../../models/cod_posts/cod_posts.model");
const Country = require("../../models/countries/countries.model");
const Patology = require("../../models/patologies/patologies.model");

const Task = require("../../models/employees/task.model");
const State = require("../../models/states/states.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    await Methods.create(req, res, next, Client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.update = async (req, res, next) => {
  try {
    await Methods.update(req, res, next, Client);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};
CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    const include = [
      {
        model: CodPost,
        include: [
          {
            model: State,
            include: [
              {
                model: Country,
              },
            ],
          },
        ],
      },
      {
        model: ClientPatology,
        include: [
          {
            model: Patology,
          },
        ],
      },
      {
        model: ClientTask,
        include: [
          {
            model: Task,
          },
        ],
      },
    ];
    await Methods.get(req, res, next, Client, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};

    const include = [
      {
        model: CodPost,
        include: [
          {
            model: State,
            include: [
              {
                model: Country,
              },
            ],
          },
        ],
      },
      {
        model: ClientPatology,
        include: [
          {
            model: Patology,
          },
        ],
      },
      {
        model: ClientTask,
        include: [
          {
            model: Task,
          },
        ],
      },
    ];

    await Methods.getAll(req, res, next, Client, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    const include = [
      {
        model: CodPost,
        include: [
          {
            model: State,
            include: [
              {
                model: Country,
              },
            ],
          },
        ],
      },
      {
        model: ClientPatology,
        include: [
          {
            model: Patology,
          },
        ],
      },
      {
        model: ClientTask,
        include: [
          {
            model: Task,
          },
        ],
      },
    ];
    await Methods.getById(req, res, next, Client, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
