const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const ClientPatology = require("../../models/clients_patologies/clients_patologies.model");
const ClientTask = require("../../models/clients_tasks/clients_tasks.model");
const ClientService = require("../../models/clients_services/clients_services.model");

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
const { applyPhoneMask, validatePhoneNumber } = require("../../utils/phoneMask.utils");
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

    // Filtro por tipo
    if (req.query.type) {
      additionalSearchConditions.push({ type: req.query.type });
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
      {
        model: ClientService,
        required: false, // LEFT JOIN para incluir clientes sin servicios
        // where: { is_deleted: 0 }, // Movido a condiciones adicionales
      },
    ];

    // Filtro por tipo
    if (req.query.type) {
      additionalSearchConditions.push({ type: req.query.type });
    }

    // Filtro por estado
    if (req.query.estado) {
      console.log('🔍 Filtro por estado:', req.query.estado);
      
      if (req.query.estado === 'activo') {
        // Cliente tiene al menos un servicio activo
        console.log('✅ Aplicando filtro ACTIVO');
        
        // Para activo, necesitamos INNER JOIN para solo incluir clientes con servicios activos
        // Cambiamos el include para que sea requerido cuando el filtro es activo
        const clientServiceInclude = {
          model: ClientService,
          required: true, // INNER JOIN - solo clientes con servicios
          where: {
            statu: true,
            is_deleted: 0
          }
        };
        
        // Reemplazamos el include de ClientService en el array
        const originalInclude = include;
        const clientServiceIndex = originalInclude.findIndex(item => item.model === ClientService);
        if (clientServiceIndex !== -1) {
          originalInclude[clientServiceIndex] = clientServiceInclude;
        }
        
        console.log('✅ Include modificado para ACTIVO:', JSON.stringify(clientServiceInclude, null, 2));
      } else if (req.query.estado === 'inactivo') {
        // Cliente tiene servicios pero ninguno activo
        console.log('✅ Aplicando filtro INACTIVO');
        // Usamos una subconsulta o NOT EXISTS para clientes que tienen servicios pero no activos
        condition[Op.and] = [
          {
            '$clients_services.id$': { [Op.not]: null }
          },
          {
            '$clients_services.is_deleted$': 0
          },
          {
            id: {
              [Op.notIn]: sequelize.literal(`
                (SELECT DISTINCT client_id 
                 FROM clients_services 
                 WHERE statu = true AND is_deleted = 0)
              `)
            }
          }
        ];
      } else if (req.query.estado === 'resto') {
        // Cliente no tiene servicios (sin registros activos en clients_services)
        condition.id = {
          [Op.notIn]: sequelize.literal(`
            (SELECT DISTINCT client_id FROM clients_services WHERE is_deleted = 0)
          `),
        };
      }
      
      console.log('🔍 Condiciones adicionales:', JSON.stringify(additionalSearchConditions, null, 2));
      console.log('🔍 Condition principal:', JSON.stringify(condition, null, 2));
    }
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
