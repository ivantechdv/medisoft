const express = require("express");
const router = express.Router();
const Client = require("../../controllers/clients/clients.controller");
const validateSchema = require('../../middleware/validator.middleware');
const { formatPhoneNumbers } = require("../../utils/phoneResponse.utils");

// Middleware para formatear teléfonos en respuestas de clientes
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
            console.log(`📞 Formatted phone: ${cleanNumber} → ${obj.phone}`);
          }
        }
        
        // Formatear teléfono de familiar_1
        if (obj.familiar_1 && typeof obj.familiar_1 === 'object') {
          if (obj.familiar_1.phone && typeof obj.familiar_1.phone === 'string') {
            const cleanNumber = obj.familiar_1.phone.replace(/\D/g, '');
            if (cleanNumber.length === 9) {
              obj.familiar_1.phone = cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
              console.log(`📞 Formatted familiar_1 phone: ${cleanNumber} → ${obj.familiar_1.phone}`);
            }
          }
        }
        
        // Formatear teléfono de familiar_2
        if (obj.familiar_2 && typeof obj.familiar_2 === 'object') {
          if (obj.familiar_2.phone && typeof obj.familiar_2.phone === 'string') {
            const cleanNumber = obj.familiar_2.phone.replace(/\D/g, '');
            if (cleanNumber.length === 9) {
              obj.familiar_2.phone = cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
              console.log(`📞 Formatted familiar_2 phone: ${cleanNumber} → ${obj.familiar_2.phone}`);
            }
          }
        }
        
        // Formatear teléfonos en el array families
        if (obj.families && Array.isArray(obj.families)) {
          obj.families = obj.families.map(family => {
            if (family.phone && typeof family.phone === 'string') {
              const cleanNumber = family.phone.replace(/\D/g, '');
              if (cleanNumber.length === 9) {
                family.phone = cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
                console.log(`📞 Formatted family phone: ${cleanNumber} → ${family.phone}`);
              }
            }
            if (family.phone2 && typeof family.phone2 === 'string') {
              const cleanNumber = family.phone2.replace(/\D/g, '');
              if (cleanNumber.length === 9) {
                family.phone2 = cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
                console.log(`📞 Formatted family phone2: ${cleanNumber} → ${family.phone2}`);
              }
            }
            return family;
          });
        }
        
        return obj;
      };
      
      // Si es un array de clientes, formatear cada uno
      if (data && data.data && Array.isArray(data.data)) {
        data.data = data.data.map(client => formatObjectPhones(client));
      }
      // Si es un solo cliente
      else if (data && typeof data === 'object') {
        data = formatObjectPhones(data);
      }
      
      return originalJson.call(this, data);
    } catch (error) {
      console.error('❌ Error formatting phones:', error);
      return originalJson.call(this, data);
    }
  };
  next();
};

router.get("/", phoneFormatMiddleware, Client.get);
router.get("/all", phoneFormatMiddleware, Client.getAll);
router.get("/:id", phoneFormatMiddleware, Client.getById);

router.post("/", Client.create);
router.put("/:id", Client.update);

module.exports = router;
