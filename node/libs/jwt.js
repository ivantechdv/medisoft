const jwt = require("jsonwebtoken");
require("dotenv").config(); // Cargar variables de entorno desde el archivo .env

const jwtAuthentication = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  // Verificar si el encabezado de autorización está presente y tiene el formato "Bearer <token>"
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No token, authorization denied", token: false });
  }

  // Obtener el token de la cabecera
  const token = authorizationHeader.split(" ")[1];

  // Verificar si el token está presente
  if (!token) {
    return res
      .status(403)
      .json({ message: "No token, authorization denied", token: false });
  }

  // Verificar y decodificar el token usando el secreto desde el archivo .env
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token", token: false });
    }

    // Adjuntar el usuario decodificado a la solicitud
    req.body.user_id = user.id;
    next();
  });
};

module.exports = jwtAuthentication;
