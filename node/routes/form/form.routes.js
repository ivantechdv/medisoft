const express = require("express");
const router = express.Router();
const cors = require("cors");
const Gender = require("../../models/genders/genders.model");
const Service = require("../../models/services/services.model");
const Language = require("../../models/languages/languages.model");
const Cook = require("../../models/cooks/cooks.model");
const EducationalLevel = require("../../models/educational_level/educational_level.model");
const TimeExperiency = require("../../models/time_experience/time_experience.model");
const GainExperiency = require("../../models/employees/gain_experience.mode");
const Tasks = require("../../models/employees/task.model");
const OfficialQualification = require("../../models/official_qualification/official_qualification");
const controller = require("../../controllers/form/form.controller");
const storageController = require("../../controllers/storage/storage.controller");
const Employee = require("../../models/employees/employees.model");
const EmployeeReference = require("../../models/employees/reference.model");
const EmployeeComplementary = require("../../models/employees/complementary.model");
const EmployeeSpecific = require("../../models/employees/specific.model");
const Country = require("../../models/countries/countries.model");
const CodPost = require("../../models/cod_posts/cod_posts.model");
const State = require("../../models/states/states.model");
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
router.get(
  "/languages",
  cors(corsOptions),
  addModelParam(Language),
  controller.get
);
router.get(
  "/countries",
  cors(corsOptions),
  addModelParam(Country),
  controller.get
);
router.get(
  "/educational-levels",
  cors(corsOptions),
  addModelParam(EducationalLevel),
  controller.get
);
router.get(
  "/time-experiencies",
  cors(corsOptions),
  addModelParam(TimeExperiency),
  controller.get
);
router.get(
  "/gain-experiencies",
  cors(corsOptions),
  addModelParam(GainExperiency),
  controller.get
);
router.get(
  "/official-qualifications",
  cors(corsOptions),
  addModelParam(OfficialQualification),
  controller.get
);

router.get(
  "/cod-posts/:provincia_id",
  cors(corsOptions),
  addModelParam(CodPost),
  controller.getByProvincia
);
router.get(
  "/provincia",
  cors(corsOptions),
  addModelParam(State),
  controller.get
);

router.get("/tasks", cors(corsOptions), addModelParam(Tasks), controller.get);

router.get("/cooks", cors(corsOptions), addModelParam(Cook), controller.get);

router.post(
  "/complementary",
  cors(corsOptions),
  addModelParam(EmployeeComplementary),
  controller.create
);
router.post(
  "/specific",
  cors(corsOptions),
  addModelParam(EmployeeSpecific),
  controller.create
);

router.post(
  "/employee",
  cors(corsOptions),
  addModelParam(Employee),
  controller.create
);

router.post("/storage", (req, res, next) => {
  const container = req.query.container || "uploads";
  const uploadMiddleware = storageController.upload(container).single("file");

  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    storageController.uploadFile(req, res);
  });
});

module.exports = router;
