const { getPhoneMask, applyPhoneMask, validatePhoneNumber } = require("../utils/phoneMask.utils");

/**
 * Middleware que añade funciones de máscara de teléfono al objeto request
 * para que estén disponibles en todos los controladores
 */
const phoneMaskMiddleware = async (req, res, next) => {
  try {
    // Añadir funciones de utilidad al objeto request
    req.getPhoneMask = getPhoneMask;
    req.applyPhoneMask = applyPhoneMask;
    req.validatePhoneNumber = validatePhoneNumber;
    
    // Obtener máscara actual y añadirla al request
    req.phoneMask = await getPhoneMask();
    
    next();
  } catch (error) {
    console.error('Error en middleware de máscara de teléfono:', error);
    req.phoneMask = '999 99 99 99'; // Máscara por defecto
    next();
  }
};

module.exports = phoneMaskMiddleware;
