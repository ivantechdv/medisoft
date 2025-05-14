const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const ClientPatology = require("../../models/clients_patologies/clients_patologies.model");
const ClientTask = require("../../models/clients_tasks/clients_tasks.model");

const CodPost = require("../../models/cod_posts/cod_posts.model");
const Country = require("../../models/countries/countries.model");
const Patology = require("../../models/patologies/patologies.model");
const Gender = require("../../models/genders/genders.model");
const Task = require("../../models/employees/task.model");
const State = require("../../models/states/states.model");
const Methods = require("../methods/methods.controller");
const Family = require("../../models/families/families.mode");
const { Sequelize, Op } = require("sequelize");
const validationField = require("../../utils/validators");
CTRL.create = async (req, res, next) => {
  try {
    // const duplicated = await validationField(
    //   Client,
    //   {
    //     dni: req.body.dni,
    //     email: req.body.email,
    //     phone: req.body.phone,
    //     code_phone: req.body.code_phone,
    //     full_name: req.body.full_name,
    //   },
    //   null,
    //   ["code_phone", "phone"]
    // );

    // if (duplicated) {
    //   return res.status(409).json({
    //     error: `Ya existe un cliente con los siguientes campos duplicados: ${duplicated.join(
    //       ", "
    //     )}`,
    //   });
    // }
    await Methods.create(req, res, next, Client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.update = async (req, res, next) => {
  try {
    // const duplicated = await validationField(
    //   Client,
    //   {
    //     dni: req.body.dni,
    //     email: req.body.email,
    //     phone: req.body.phone,
    //     code_phone: req.body.code_phone,
    //     full_name: req.body.full_name,
    //   },
    //   req.params.id, // <- el ID actual para excluirlo
    //   ["code_phone", "phone"]
    // );

    // if (duplicated) {
    //   return res.status(409).json({
    //     error: `Ya existe un cliente con los siguientes campos duplicados: ${duplicated.join(
    //       ", "
    //     )}`,
    //   });
    // }
    await Methods.update(req, res, next, Client);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};
CTRL.get = async (req, res, next) => {
  try {
    let additionalSearchConditions = [];

    if (req.query.searchTerm) {
      additionalSearchConditions = [
        { "$families.name$": { [Op.like]: `%${req.query.searchTerm}%` } },
        { "$families.phone$": { [Op.like]: `%${req.query.searchTerm}%` } },
      ];
    }
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
      {
        model: Gender,
      },
      {
        model: Family,
        order: [["priority", "Asc"]],
        separate: false, // <--- Run separate query
        limit: 2,
      },
    ];
    await Methods.get(
      req,
      res,
      next,
      Client,
      condition,
      include,
      additionalSearchConditions
    );
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
      {
        model: Gender,
      },
      {
        model: Family,
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
      {
        model: Family,
      },
    ];
    await Methods.getById(req, res, next, Client, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
