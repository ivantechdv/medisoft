const CTRL = {};
const sequelize = require("../../database/sequelize");
const UserPreference = require("../../models/users/userPreferences.model");
const Methods = require("../methods/methods.controller");
const { Op } = require("sequelize");

CTRL.getPreferences = async (req, res, next) => {
  try {
    const { entity } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const condition = {
      user_id: userId,
    };

    if (entity) {
      condition.entity = entity;
    }

    const preferences = await UserPreference.findAll({
      where: condition,
      attributes: ["entity", "preferences", "updatedAt"],
    });

    // Si se solicitó una entidad específica, devolver solo sus preferencias
    if (entity) {
      return res.json(preferences.length > 0 ? preferences[0].preferences : {});
    }

    // Si no, devolver todas las preferencias agrupadas por entidad
    const result = preferences.reduce((acc, pref) => {
      acc[pref.entity] = pref.preferences;
      return acc;
    }, {});

    res.json(result);
  } catch (error) {
    console.error("Error al obtener preferencias:", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.upsertPreferences = async (req, res, next) => {
  try {
    const { entity, preferences } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!entity || typeof preferences !== "object") {
      return res.status(400).json({ error: "entity y preferences son requeridos" });
    }

    const [preference, created] = await UserPreference.findOrCreate({
      where: {
        user_id: userId,
        entity,
      },
      defaults: {
        user_id: userId,
        entity,
        preferences,
      },
    });

    if (!created) {
      await preference.update({ preferences });
    }

    res.json({ success: true, entity, preferences });
  } catch (error) {
    console.error("Error al guardar preferencias:", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.deletePreferences = async (req, res, next) => {
  try {
    const { entity } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const deleted = await UserPreference.destroy({
      where: {
        user_id: userId,
        entity,
      },
    });

    res.json({ success: true, deleted: deleted > 0 });
  } catch (error) {
    console.error("Error al eliminar preferencias:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
