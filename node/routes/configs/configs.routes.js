const express = require("express");
const router = express.Router();
const CTRL = require("../../controllers/configs/configs.controller");

// Rutas de configuración principal
router.post("/", CTRL.create);
router.get("/", CTRL.getAll);
router.get("/active", CTRL.get);
router.put("/:id", CTRL.update);

// Endpoints para datos relacionados
router.get("/countries/list", CTRL.getCountries);
router.get("/states/:countryId", CTRL.getStatesByCountry);
router.get("/languages/list", CTRL.getLanguages);
router.get("/levels/list", CTRL.getLevels);

// Endpoints para máscara de teléfono
router.get("/phone-mask", CTRL.getMask);

// Ruta paramétrica al final para evitar conflictos
router.get("/:id", CTRL.getById);

module.exports = router;
