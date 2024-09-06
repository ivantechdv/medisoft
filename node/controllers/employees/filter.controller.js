const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const CodPost = require("../../models/cod_posts/cod_posts.model");
const Country = require("../../models/countries/countries.model");
const EmployeeComplementary = require("../../models/employees/complementary.model");
const EmployeeFilter = require("../../models/employees/employee_filters.model");
const Employee = require("../../models/employees/employees.model");
const EmployeeReference = require("../../models/employees/reference.model");
const State = require("../../models/states/states.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, EmployeeReference);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};
CTRL.update = async (req, res, next) => {
  try {
    await Methods.update(req, res, next, EmployeeReference);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};
CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, EmployeeReference, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const models = {
  Gender: require("../../models/genders/genders.model"),
  Language: require("../../models/languages/languages.model"),
  EducationalLevel: require("../../models/educational_level/educational_level.model"),
  TimeExperience: require("../../models/time_experience/time_experience.model"),
  Cook: require("../../models/cooks/cooks.model"),
  Task: require("../../models/employees/task.model"),
  Service: require("../../models/services/services.model"),
  Patology: require("../../models/patologies/patologies.model"),
};
async function getRelatedData(filter) {
  let relatedData = null;
  const modelName = filter.model;
  const Model = models[modelName];
  if (Model) {
    relatedData = await Model.findAll();
    //  console.log("relatedData", relatedData);
  }

  return relatedData;
}
CTRL.getAll = async (req, res, next) => {
  try {
    const filters = await EmployeeFilter.findAll();

    const filtersWithRelatedData = await Promise.all(
      filters.map(async (filter) => {
        const relatedData = await getRelatedData(filter);
        return {
          ...filter.toJSON(), // convierte el filtro en JSON
          relatedData: relatedData ? relatedData : null, // añade los datos relacionados si existen
        };
      })
    );

    // Devuelve el resultado en JSON
    return res.json(filtersWithRelatedData);
  } catch (error) {
    console.error("Error al obtener los filtros:", error);
    return res.status(500).json({ error: "Error al obtener los filtros" });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    const include = [];
    Methods.getById(req, res, next, EmployeeReference, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
