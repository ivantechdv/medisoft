const CTRL = {};
const sequelize = require("../../database/sequelize");
const User = require("../../models/users/users.model");
const Methods = require("../methods/methods.controller");
const axios = require('axios');
const jwtService = require("../../services/JWTServices");
const { Sequelize, Op } = require('sequelize');
const bcrypt = require("bcrypt");
const emailConfig = require("../../config/email.config");

CTRL.login = async (req, res, next) => {
  // 1. Extraemos el token del captcha enviado desde el frontend
  const { email, password, captchaToken } = req.body;

  try {
    // 2. Validaciones básicas de entrada
    if (!email || !password) {
      return res.json({
        statusCode: 500,
        message: "Email y contraseña son requeridos",
      });
    }

    // 3. Validar reCAPTCHA con Google
    if (!captchaToken) {
      return res.json({
        statusCode: 500,
        message: "La verificación del captcha es obligatoria",
      });
    }

const secretKey = process.env.ENV === 'dev' 
    ? process.env.GOOGLE_PRIVATE_KEY_CAPTCHA_DEV 
    : process.env.GOOGLE_PRIVATE_KEY_CAPTCHA_PROD;

const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    const googleResponse = await axios.post(googleVerifyUrl);
    
    if (!googleResponse.data.success) {
      return res.json({
        statusCode: 500,
        message: "Error en la validación del reCAPTCHA. Inténtalo de nuevo.",
      });
    }

    // --- A partir de aquí sigue tu lógica original ---

    // Find user by email using Sequelize
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
    res.json({ statusCode: 500, message: "Error interno del servidor" });
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

/**
 * Enviar correo de invitación para que el usuario establezca su contraseña.
 * POST /api/v1/users/:id/send-password-email
 * Body: { email, redirect_url }
 */
CTRL.sendPasswordEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, redirect_url } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    // Generar token de invitación (1 día)
    const token = jwtService.generateInviteToken({ id: user.id }, "1d");

    const url = `${redirect_url}?token=${token}`;

    const subject = "Invitación: establecer contraseña";
    const template = `<p>Hola ${user.full_name || user.email},</p>
      <p>Has sido registrado en la plataforma. Haz clic en el siguiente enlace para establecer tu contraseña:</p>
      <p><a href="${url}">${url}</a></p>
      <p>El enlace expirará en 24 horas.</p>`;

    // Guardar token y fecha de expiración en la BD (para control adicional)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    await User.update({ invite_token: token, invite_expires: expiresAt }, { where: { id: user.id } });

    // Enviar correo usando config (si no se pasan credenciales, email.config tomará de env)
    await emailConfig.enviarCorreo(process.env.EMAIL_USER, process.env.EMAIL_PASS, [email], subject, template);

    return res.json({ success: true, message: "Correo de invitación enviado", url });
  } catch (error) {
    console.error("Error enviando correo de invitación:", error);
    return res.status(500).json({ success: false, message: "Error al enviar correo de invitación" });
  }
};

/**
 * Validar token de invitación.
 * POST /api/v1/users/validate-invite
 * Body: { token }
 */
CTRL.validateInvite = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ valid: false, message: "Token requerido" });

    const decoded = jwtService.verifyToken(token);
    if (!decoded) return res.status(400).json({ valid: false, message: "Token inválido o expirado" });

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ valid: false, message: "Usuario no encontrado" });

    // Comprobar que el token coincida con el token almacenado y que no haya expirado
    if (!user.invite_token || user.invite_token !== token) {
      return res.status(400).json({ valid: false, message: "Token no coincide" });
    }
    if (!user.invite_expires || new Date(user.invite_expires) < new Date()) {
      return res.status(400).json({ valid: false, message: "Token expirado" });
    }

    return res.json({ valid: true, userId: user.id });
  } catch (error) {
    console.error("Error validando token:", error);
    return res.status(500).json({ valid: false, message: "Error al validar token" });
  }
};

/**
 * Establecer contraseña a partir del token.
 * POST /api/v1/users/set-password
 * Body: { token, password }
 */
CTRL.setPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: "Token y password son requeridos" });

    const decoded = jwtService.verifyToken(token);
    if (!decoded) return res.status(400).json({ success: false, message: "Token inválido o expirado" });

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    // Comprobar token almacenado y expiración
    if (!user.invite_token || user.invite_token !== token) {
      return res.status(400).json({ success: false, message: "Token no coincide" });
    }
    if (!user.invite_expires || new Date(user.invite_expires) < new Date()) {
      return res.status(400).json({ success: false, message: "Token expirado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.update({ password: hashed, is_active: true, invite_token: null, invite_expires: null }, { where: { id: user.id } });

    return res.json({ success: true, message: "Contraseña establecida correctamente" });
  } catch (error) {
    console.error("Error estableciendo contraseña:", error);
    return res.status(500).json({ success: false, message: "Error al establecer contraseña" });
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
