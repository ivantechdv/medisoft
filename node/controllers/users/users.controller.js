const CTRL = {};
const sequelize = require("../../database/sequelize");
const User = require("../../models/users/users.model");
const Methods = require("../methods/methods.controller");

const jwtService = require("../../services/JWTServices");
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
    const condition = {};

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
module.exports = CTRL;
