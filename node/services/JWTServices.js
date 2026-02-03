const jwt = require("jsonwebtoken");
require("dotenv").config(); // Cargar variables de entorno desde el archivo .env

// Obtener el secreto JWT desde las variables de entorno
const secret = process.env.JWT_SECRET;

// Función para generar un token JWT
function generateToken(user) {
  try {
    return jwt.sign({ id: user.id }, secret, {
      expiresIn: 86400, // 24 horas
    });
  } catch (error) {
    console.error("Error al generar el token:", error);
    throw new Error("No se pudo generar el token");
  }
}

// Función para decodificar un token JWT
function decodeToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    throw new Error("Token inválido");
  }
}

// Generar token de invitación con tiempo de expiración personalizable
function generateInviteToken(payload, expiresIn = "1d") {
  try {
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error("Error al generar invite token:", error);
    throw new Error("No se pudo generar el invite token");
  }
}

// Verificar token (misma lógica que decodeToken pero devuelve null en caso de expirado/inválido)
function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

module.exports = { generateToken, decodeToken, generateInviteToken, verifyToken };
