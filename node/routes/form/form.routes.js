const express = require("express");
const router = express.Router();
const cors = require("cors");
const Gender = require("../../models/genders/genders.model");
const Service = require("../../models/services/services.model");
const controller = require("../../controllers/form/form.controller");
/* const  authRequired = require('../../middleware/validateToken');*/
const addModelParam = (model) => {
  return (req, res, next) => {
    req.params.model = model;
    next();
  };
};
// 🔹 Configuración CORS para estas rutas en específico
const corsOptions = {
  origin: ["https://quidharma.com"], // Solo permitir este dominio externo
  credentials: true,
};
router.get(
  "/genders",
  cors(corsOptions),
  addModelParam(Gender),
  controller.get
);
router.get(
  "/services",
  cors(corsOptions),
  addModelParam(Service),
  controller.get
);
module.exports = router;
