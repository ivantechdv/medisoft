const express = require("express");
const router = express.Router();
const CTRL = require("../../controllers/configs/configs.controller");
const PhoneMaskCTRL = require("../../controllers/configs/phoneMask.controller");

// Rutas de configuración principal
router.post("/", CTRL.create);
router.get("/", CTRL.getAll);
router.get("/active", CTRL.get);
router.get("/:id", CTRL.getById);
router.put("/:id", CTRL.update);

// Endpoints para datos relacionados
router.get("/countries/list", CTRL.getCountries);
router.get("/states/:countryId", CTRL.getStatesByCountry);
router.get("/languages/list", CTRL.getLanguages);
router.get("/levels/list", CTRL.getLevels);

// Endpoints para máscara de teléfono
router.get("/phone-mask", PhoneMaskCTRL.getMask);
router.post("/phone-mask/apply", PhoneMaskCTRL.applyMask);
router.post("/phone-mask/validate", PhoneMaskCTRL.validatePhone);

module.exports = router;
