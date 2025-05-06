const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const CodPost = require("../../models/cod_posts/cod_posts.model");
const Country = require("../../models/countries/countries.model");
const Employee = require("../../models/employees/employees.model");
const EmployeeSpecific = require("../../models/employees/specific.model");
const EmployeeComplementary = require("../../models/employees/complementary.model");
const State = require("../../models/states/states.model");
const Methods = require("../methods/methods.controller");
const { Sequelize, Op } = require("sequelize");
const Gender = require("../../models/genders/genders.model");
const validationField = require("../../utils/validators");
CTRL.create = async (req, res, next) => {
  try {
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
    Methods.create(req, res, next, Employee);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};
CTRL.update = async (req, res, next) => {
  try {
    await Methods.update(req, res, next, Employee);
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
        model: Gender,
      },
      {
        model: EmployeeSpecific,
      },
      {
        model: EmployeeComplementary,
      },
    ];
    Methods.get(req, res, next, Employee, condition, include);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    // const include = {
    //   model: Client,
    // };
    const include = [
      {
        model: EmployeeSpecific,
      },
      {
        model: EmployeeComplementary,
      },
    ];
    Methods.getAll(req, res, next, Employee, condition, include);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
  }
};
const processQueryParameters = (queryParameters) => {
  const andConditions = [];
  const orConditions = [];
  const extraAndConditions = [];

  Object.keys(queryParameters).forEach((key) => {
    const value = queryParameters[key];

    const createCondition = (field, operator, value) => {
      console.log("field", field);
      if (field.includes(".")) {
        // Usar FIND_IN_SET si es un campo relacionado
        return Sequelize.where(
          Sequelize.fn(
            "FIND_IN_SET",
            Sequelize.literal(value),
            Sequelize.col(field)
          ),
          { [Op.gt]: 0 }
        );
      } else {
        return {
          [field]:
            operator === "LIKE" ? { [Op.like]: value } : { [Op.eq]: value },
        };
      }
    };

    const [operator, rawValue] = value.split(":");
    // const condition = createCondition(key, operator, rawValue);

    if (key.startsWith("OR-")) {
      // Condición OR
      const actualKey = key.substring(3);
      const fields = actualKey.split("OR-");
      const orCondition = fields.map((field) =>
        createCondition(field, operator, rawValue)
      );
      orConditions.push({ [Op.or]: orCondition });
    } else if (key.startsWith("AND-")) {
      // Condición AND adicional
      const actualKey = key.substring(4);
      extraAndConditions.push(createCondition(actualKey, operator, rawValue));
    } else {
      // Condición AND
      andConditions.push(createCondition(key, operator, rawValue));
    }
  });

  // Combinar las condiciones lógicas como antes
  const condition = {};

  if (andConditions.length) {
    if (orConditions.length) {
      if (extraAndConditions.length) {
        condition[Op.and] = [
          ...extraAndConditions,
          { [Op.or]: [{ [Op.and]: andConditions }, ...orConditions] },
        ];
      } else {
        condition[Op.or] = [{ [Op.and]: andConditions }, ...orConditions];
      }
    } else {
      if (extraAndConditions.length) {
        condition[Op.and] = [...andConditions, ...extraAndConditions];
      } else {
        condition[Op.and] = andConditions;
      }
    }
  } else if (orConditions.length) {
    if (extraAndConditions.length) {
      condition[Op.and] = [...extraAndConditions, { [Op.or]: orConditions }];
    } else {
      condition[Op.or] = orConditions;
    }
  } else if (extraAndConditions.length) {
    condition[Op.and] = extraAndConditions;
  }

  return condition;
};
CTRL.getBySearch = async (req, res, next) => {
  try {
    const { patologies = null, ...queryParameters } = req.query;
    let conditions;
    let patologie;
    let employees;
    if (queryParameters) {
      conditions = processQueryParameters(queryParameters);
      console.log("conditions", conditions);
      employees = await Employee.findAll({
        where: conditions,
        include: [
          {
            model: EmployeeSpecific,
          },
          {
            model: EmployeeComplementary,
          },
        ],
      });
    } else {
      if (patologies) {
        console.log("patologia =>", patologies);
        patologie = patologies.split(",").map(Number);
      }

      if (patologies) {
        employees = await Employee.findAll({
          include: [
            {
              model: EmployeeSpecific,
              where: {
                patologies: {
                  [Op.or]: patologie.map((patology) => ({
                    [Op.like]: `%${patology}%`,
                  })),
                },
              },
            },
          ],
        });
      } else {
      }
    }

    res.json(employees);
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
    ];
    Methods.getById(req, res, next, Employee, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
