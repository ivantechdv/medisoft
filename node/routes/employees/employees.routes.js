const express = require("express");
const router = express.Router();
const Employee = require("../../controllers/employees/employees.controller");
const Complementary = require("../../controllers/employees/complementary.controller");
const Task = require("../../controllers/employees/task.controller");
const GainExperience = require("../../controllers/employees/gain_experience.controller");
const Specific = require("../../controllers/employees/specific.controller");
const Reference = require("../../controllers/employees/reference.controller");
const Filter = require("../../controllers/employees/filter.controller");
const Status = require("../../controllers/employees/status.controller");
const Level = require("../../controllers/employees/level.controller");

// Middleware para formatear teléfonos en respuestas de employees
const phoneFormatMiddleware = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    try {
      // Función para formatear un objeto si tiene teléfonos
      const formatObjectPhones = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        
        // Formatear teléfono principal
        if (obj.phone && typeof obj.phone === 'string') {
          const cleanNumber = obj.phone.replace(/\D/g, '');
          if (cleanNumber.length === 9) {
            obj.phone = cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
            console.log(`📞 Formatted employee phone: ${cleanNumber} → ${obj.phone}`);
          }
        }
        
        // Formatear teléfono secundario
        if (obj.phone2 && typeof obj.phone2 === 'string') {
          const cleanNumber = obj.phone2.replace(/\D/g, '');
          if (cleanNumber.length === 9) {
            obj.phone2 = cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
            console.log(`📞 Formatted employee phone2: ${cleanNumber} → ${obj.phone2}`);
          }
        }
        
        // Formatear código de teléfono
        if (obj.code_phone && typeof obj.code_phone === 'string') {
          const cleanNumber = obj.code_phone.replace(/\D/g, '');
          if (cleanNumber.length === 9) {
            obj.code_phone = cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
            console.log(`📞 Formatted employee code_phone: ${cleanNumber} → ${obj.code_phone}`);
          }
        }
        
        // Formatear código de teléfono secundario
        if (obj.code_phone2 && typeof obj.code_phone2 === 'string') {
          const cleanNumber = obj.code_phone2.replace(/\D/g, '');
          if (cleanNumber.length === 9) {
            obj.code_phone2 = cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
            console.log(`📞 Formatted employee code_phone2: ${cleanNumber} → ${obj.code_phone2}`);
          }
        }
        
        return obj;
      };
      
      // Si es un array de employees, formatear cada uno
      if (data && data.data && Array.isArray(data.data)) {
        data.data = data.data.map(employee => formatObjectPhones(employee));
      }
      // Si es un solo employee
      else if (data && typeof data === 'object') {
        data = formatObjectPhones(data);
      }
      
      return originalJson.call(this, data);
    } catch (error) {
      console.error('❌ Error formatting employee phones:', error);
      return originalJson.call(this, data);
    }
  };
  next();
};

/* const  authRequired = require('../../middleware/validateToken');*/
router.post("/reference", Reference.create);
router.get("/reference/all", Reference.getAll);
router.put("/reference/:id", Reference.update);

router.post("/specific", Specific.create);
router.get("/specific/all", Specific.getAll);
router.put("/specific/:id", Specific.update);

router.post("/complementary", Complementary.create);
router.get("/complementary/all", Complementary.getAll);
router.put("/complementary/:id", Complementary.update);

router.post("/gain-experience", GainExperience.create);
router.get("/gain-experience/all", GainExperience.getAll);
router.put("/gain-experience/:id", GainExperience.update);

router.post("/task", Task.create);
router.get("/task/all", Task.getAll);
router.put("/task/:id", Task.update);

router.post("/level", Level.create);
router.get("/level/all", Level.getAll);

router.post("/status", Status.create);
router.get("/status/all", Status.getAll);
router.put("/status/:id", Status.update);

router.post("/filter", Filter.create);
router.get("/filter/all", Filter.getAll);
router.put("/filter/:id", Filter.update);

router.get("/", phoneFormatMiddleware, Employee.get);
router.get("/all", phoneFormatMiddleware, Employee.getAll);
router.get("/getBySearch", phoneFormatMiddleware, Employee.getBySearch);
router.get("/:id", phoneFormatMiddleware, Employee.getById);
router.post("/", Employee.create);
router.put("/:id", Employee.update);

module.exports = router;
