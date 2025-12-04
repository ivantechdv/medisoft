const CTRL = {};
const sequelize = require("../../database/sequelize");
const User = require("../../models/users/users.model");
const Methods = require("../methods/methods.controller");

const jwtService = require("../../services/JWTServices");
const { Sequelize, Op } = require('sequelize');
const bcrypt = require("bcrypt");

CTRL.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email using Sequelize
    if (!email || !password) {
      return res.json({
        statusCode: 500,
        message: "Email y contraseña son requeridos",
      });
    }
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({
        statusCode: 500,
        message: "Usuario no encontrado",
      });
    } else if (!user.is_active) {
      return res.json({
        statusCode: 500,
        message: "Usuario no activo, contacte al administrador",
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.json({
        statusCode: 500,
        message: "Credenciales invalidas",
      });
    }

    // Generate JWT token
    const token = jwtService.generateToken(user);

    // Send response with the token
    res.json({
      success: true,
      statusCode: 200,
      user,
      token: token,
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.send({ statusCode: 500, message: "Error interno del servidor" });
  }
};

CTRL.create = async (req, res, next) => {
  try {
    Methods.create(req, res, next, User);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.get = async (req, res, next) => {
  try {
    Methods.get(req, res, next, User);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.getById = async (req, res, next) => {
  try {
    const condition = {};
    const include = [];
    await Methods.getById(req, res, next, User, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

CTRL.getAll = async (req, res, next) => {
  try {
    const condition = {is_active:1};

    const include = [];

    await Methods.getAll(req, res, next, User, condition, include);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
CTRL.update = async (req, res, next) => {
  try {
    await Methods.update(req, res, next, User);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message });
  }
};

CTRL.changeStatus = async (req, res, next) => {
  try {
    // La solicitud desde el frontend (PUT /users/bulk-deactivate) 
    // debe enviar los IDs en el cuerpo: { ids: [1, 5, 8] }
    const userIds = req.body.ids;
    const is_active = req.body.is_active;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        message: "Se requiere un array de IDs (ids) en el cuerpo de la solicitud." 
      });
    }

    // Llama al método que manejará la lógica de desactivación
    const result = await Methods.bulkUpdateStatus(User, userIds, { is_active:is_active });

    res.status(200).json({ 
      success: true, 
      message: `Usuarios desactivados: ${result.nModified || result.count}`,
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
