const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const Service = require("../../models/services/services.model");
const Methods = require("../methods/methods.controller");
const { Sequelize, Op } = require('sequelize');
CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, Service);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, Service, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    // const include = {
    //   model: Client,
    // };
    const include = null;
    Methods.getAll(req, res, next, Service, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, Service, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.changeStatus = async (req, res, next) => {
  try {
    // La solicitud desde el frontend (PUT /users/bulk-deactivate) 
    // debe enviar los IDs en el cuerpo: { ids: [1, 5, 8] }
    const ids = req.body.ids;
    const is_active = req.body.is_active;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        message: "Se requiere un array de IDs (ids) en el cuerpo de la solicitud." 
      });
    }

    // Llama al método que manejará la lógica de desactivación
    const result = await Methods.bulkUpdateStatus(Service, ids, { is_active:is_active });

    res.status(200).json({ 
      success: true, 
      message: `servicios actualizados: ${result.nModified || result.count}`,
      result 
    });

  } catch (error) {
    console.error("Error en bulkDeactivate:", error);
    res.status(500).json({ error: "Error interno del servidor al desactivar usuarios." });
  }
};


Methods.bulkUpdateStatus = async (Model, ids, updateData) => {
  try {
    // Utiliza update para actualizar múltiples registros
    const [count, rows] = await Model.update(
      updateData, // Aplicar el cambio de estado (e.g., { is_active: 0 })
      { 
        where: { 
          id: { 
            [Op.in]: ids // Buscar IDs que estén en el array 'ids'
          } 
        } 
      }
    );
    return { count }; // Sequelize devuelve el número de filas afectadas
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = CTRL;
