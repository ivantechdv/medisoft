require("dotenv").config(); // Asegúrate de tener el TOKEN_EXTERNO en el .env

const tokenExternal = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No token, authorization denied", token: false });
  }

  const token = authorizationHeader.split(" ")[1];

  if (token !== process.env.TOKEN_EXTERNO) {
    return res
      .status(403)
      .json({ message: "Invalid external token", token: false });
  }

  next(); // Token válido, continúa con la petición
};

module.exports = tokenExternal;
