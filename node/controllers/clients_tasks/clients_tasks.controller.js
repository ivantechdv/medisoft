const CTRL = {};
const sequelize = require("../../database/sequelize");
const Client = require("../../models/clients/clients.model");
const ClientTask = require("../../models/clients_tasks/clients_tasks.model");
const CodPost = require("../../models/cod_posts/cod_posts.model");
const Methods = require("../methods/methods.controller");

CTRL.create = async (req, res, next) => {
  try {
    const clientsPatologiesData = req.body;
    const clientId =
      clientsPatologiesData.length > 0
        ? clientsPatologiesData[0].client_id
        : null;

    if (!clientId) {
      return res.status(400).json({ error: "Client ID is required" });
    }

    const condition = { client_id: clientId };
    const include = [];

    // Obtener patologías existentes
    const existingPatologies = await Methods.getAll(
      req,
      res,
      next,
      ClientTask,
      condition,
      include,
      true
    );

    const existingPatologyIds = existingPatologies.map((cp) => cp.task_id);
    const newPatologyIds = clientsPatologiesData.map((cp) => cp.task_id);

    // Filtrar cuáles agregar y cuáles eliminar
    const patologiesToAdd = newPatologyIds.filter(
      (p) => !existingPatologyIds.includes(p)
    );
    const patologiesToRemove = existingPatologyIds.filter(
      (p) => !newPatologyIds.includes(p)
    );

    // Eliminar patologías
    if (patologiesToRemove.length > 0) {
      const where = {
        client_id: clientId,
        task_id: patologiesToRemove,
      };
      await Methods.delete(req, res, next, ClientTask, where, true);
    }

    // Agregar nuevas patologías
    if (patologiesToAdd.length > 0) {
      const dataToInsert = patologiesToAdd
        .filter((task_id) => task_id !== 0)
        .map((task_id) => ({
          client_id: clientId,
          task_id,
        }));
      await Methods.createOrUpdateBulk(dataToInsert, ClientTask);
    }

    // Enviar una sola respuesta
    return res.status(200).json(true);
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    const condition = {};
    Methods.get(req, res, next, ClientTask, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {};
    const include = {
      model: Client,
    };
    Methods.getAll(req, res, next, ClientTask, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    Methods.getById(req, res, next, ClientTask, condition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
