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
const { Sequelize, Op, UniqueConstraintError } = require("sequelize");
const Gender = require("../../models/genders/genders.model");
const validationField = require("../../utils/validators");
const ClientsServices = require("../../models/clients_services/clients_services.model");
const Status = require("../../models/employees/status.model");
const Level = require("../../models/employees/level.model");

CTRL.create = async (req, res, next) => {
  try {
    await Methods.create(req, res, next, Employee);
  } catch (error) {
    console.error("Error Sequelize:", error);

    // Manejo de unique constraint (compuesto o simple)
    if (error.name === "SequelizeUniqueConstraintError") {
      const errors = error.errors.map(
        (e) =>
          `El valor '${e.value}' ya está registrado en el campo '${e.path}'`
      );
      return res.status(409).json({ errors });
    }

    // Otros errores
    return res.status(500).json({ error: error.message });
  }
};

CTRL.update = async (req, res, next) => {
  try {
    // const duplicated = await validationField(
    //   Employee,
    //   {
    //     dni: req.body.dni,
    //     email: req.body.email,
    //     phone: req.body.phone,
    //     code_phone: req.body.code_phone,
    //     full_name: req.body.full_name,
    //     num_social_security: req.body.num_social_security,
    //   },
    //   req.params.id,
    //   ["code_phone", "phone"]
    // );

    // if (duplicated) {
    //   return res.status(409).json({
    //     error: `Ya existe un cuidador con los siguientes campos duplicados: ${duplicated.join(
    //       ", "
    //     )}`,
    //   });
    // }
    await Methods.update(req, res, next, Employee);
  } catch (error) {
    console.log("error", error);
    if (error instanceof UniqueConstraintError) {
      // Mapeamos todos los errores
      const duplicates = await Promise.all(
        error.errors.map(async (err) => {
          const field = err.path; // campo (dni, email, etc.)
          const value = err.value; // valor duplicado

          // Buscar en qué registro ya existe
          const existing = await Employee.findOne({
            where: { [field]: value },
            attributes: ["id", "full_name", field],
          });

          if (existing) {
            return `El valor '${value}' ya está registrado en el campo '${field}' en el registro #${existing.id} (${existing.full_name}).`;
          }

          return `El valor '${value}' ya está registrado en el campo '${field}'.`;
        })
      );

      return res.status(409).json({ errors: duplicates });
    }

    console.error("error", error);
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
      {
        model: ClientsServices,
      },
      {
        model: Status,
      },
      {
        model: Level,
      },
    ];
    const { searchTerm } = req.query;
    const additionalSearchConditions = searchTerm
      ? [{ start_date: { [Op.like]: `%${searchTerm}%` } }]
      : [];

    Methods.get(
      req,
      res,
      next,
      Employee,
      condition,
      include,
      additionalSearchConditions
    );
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
      {
        model: ClientsServices,
      },
      {
        model: Status,
      },
      {
        model: Level,
      },
    ];
    Methods.getAll(req, res, next, Employee, condition, include);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
  }
};
const processQueryParameters = (queryParameters) => {
  const INTEGER_FIELDS = new Set([
    "gender_id",
    "country_id",
    "cod_post_id",
    "level_id",
    "statu_id",
    "country_current_id",
    "state_id",
    "type",
    "cook_id",
    "educational_level_id",
    "time_experience_id",
  ]);

  const FIELD_ALIASES = {
    "Gender.id": "gender_id",
    "genders.id": "gender_id",
    "Country.id": "country_id",
    "countries.id": "country_id",
    "Level.id": "level_id",
    "levels.id": "level_id",
    "Status.id": "statu_id",
    "statuses.id": "statu_id",
    "CodPost.id": "cod_post_id",
    "cod_posts.id": "cod_post_id",
  };

  const CSV_FIELDS = new Set([
    "employee_complementary.language_id",
    "employee_specific.patologies",
    "employee_specific.tasks",
    "employee_specific.services",
  ]);

  const BOOLEAN_FIELDS = new Set([
    "is_active",
    "employee_complementary.driving_license",
    "employee_complementary.own_vehicle",
  ]);

  const parseFilterParam = (paramValue) => {
    if (!paramValue || typeof paramValue !== "string") return null;

    const colonIndex = paramValue.indexOf(":");
    if (colonIndex === -1) {
      return { operator: "=", rawValue: paramValue };
    }

    const operator = paramValue.slice(0, colonIndex);
    const rawValue = paramValue.slice(colonIndex + 1);

    if (!operator || rawValue === "") return null;

    return { operator, rawValue };
  };

  const parseFieldValue = (field, rawValue) => {
    if (INTEGER_FIELDS.has(field) || field.endsWith("_id")) {
      const asNumber = Number(rawValue);
      if (!Number.isNaN(asNumber)) return asNumber;
    }

    if (rawValue === "true") return true;
    if (rawValue === "false") return false;

    return rawValue;
  };

  const buildOperatorCondition = (field, operator, parsedValue) => {
    switch (operator) {
      case "LIKE":
        return { [field]: { [Op.like]: parsedValue } };
      case ">":
        return { [field]: { [Op.gt]: parsedValue } };
      case "<":
        return { [field]: { [Op.lt]: parsedValue } };
      case "!=":
      case "<>":
        return { [field]: { [Op.ne]: parsedValue } };
      case "=":
      default:
        return { [field]: { [Op.eq]: parsedValue } };
    }
  };

  const buildAgeCondition = (operator, rawValue) => {
    const parsedValue = Number(rawValue);
    const ageExpr = Sequelize.fn(
      "TIMESTAMPDIFF",
      Sequelize.literal("YEAR"),
      Sequelize.col("born_date"),
      Sequelize.fn("CURDATE")
    );

    switch (operator) {
      case ">":
        return Sequelize.where(ageExpr, { [Op.gt]: parsedValue });
      case "<":
        return Sequelize.where(ageExpr, { [Op.lt]: parsedValue });
      case "!=":
      case "<>":
        return Sequelize.where(ageExpr, { [Op.ne]: parsedValue });
      case "=":
      default:
        return Sequelize.where(ageExpr, { [Op.eq]: parsedValue });
    }
  };

  const createCondition = (field, operator, rawValue) => {
    const normalizedField = FIELD_ALIASES[field] || field;

    if (normalizedField === "age") {
      return buildAgeCondition(operator, rawValue);
    }

    let parsedValue = parseFieldValue(normalizedField, rawValue);

    if (BOOLEAN_FIELDS.has(normalizedField)) {
      if (rawValue === "1" || rawValue === 1) parsedValue = true;
      if (rawValue === "0" || rawValue === 0) parsedValue = false;
    }

    if (normalizedField.includes(".") && CSV_FIELDS.has(normalizedField)) {
      return Sequelize.where(
        Sequelize.fn(
          "FIND_IN_SET",
          Sequelize.literal(String(parsedValue)),
          Sequelize.col(normalizedField)
        ),
        { [Op.gt]: 0 }
      );
    }

    if (normalizedField.includes(".")) {
      const sequelizeField = `$${normalizedField}$`;
      return buildOperatorCondition(sequelizeField, operator, parsedValue);
    }

    return buildOperatorCondition(normalizedField, operator, parsedValue);
  };

  let combinedCondition = null;

  Object.keys(queryParameters).forEach((key) => {
    const parsed = parseFilterParam(queryParameters[key]);
    if (!parsed) return;

    const { operator, rawValue } = parsed;

    let logic = "AND";
    let field = key;

    if (key.startsWith("OR-")) {
      logic = "OR";
      field = key.substring(3);
    } else if (key.startsWith("AND-")) {
      logic = "AND";
      field = key.substring(4);
    }

    const condition = createCondition(field, operator, rawValue);

    if (combinedCondition === null) {
      combinedCondition = condition;
      return;
    }

    combinedCondition =
      logic === "OR"
        ? { [Op.or]: [combinedCondition, condition] }
        : { [Op.and]: [combinedCondition, condition] };
  });

  return combinedCondition || {};
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
        where: { ...conditions, is_deleted: false },
        include: [
          { model: Gender },
          { model: EmployeeSpecific, required: false },
          { model: EmployeeComplementary, required: false },
          { model: Status },
          { model: Level },
          { model: ClientsServices, required: false },
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
