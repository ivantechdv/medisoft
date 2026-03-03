const Config = require("../models/configs/configs.model");

/**
 * Obtiene la máscara de teléfono configurada
 * @returns {Promise<string>} Máscara de teléfono activa
 */
const getPhoneMask = async () => {
  try {
    const config = await Config.findOne({
      where: { is_active: true },
      attributes: ['phone_mask']
    });
    
    if (!config) {
      return '999 99 99 99';
    }
    
    return config.phone_mask;
  } catch (error) {
    console.error('Error al obtener máscara de teléfono:', error);
    return '999 99 99 99'; 
  }
};

/**
 * Aplica la máscara a un número de teléfono
 * @param {string} phoneNumber - Número de teléfono sin formatear
 * @param {string} mask - Máscara a aplicar (opcional, si no se proporciona usa la configurada)
 * @returns {Promise<string>} Número de teléfono formateado
 */
const applyPhoneMask = async (phoneNumber, mask = null) => {
  try {
    // Limpiar el número: solo dígitos
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Obtener máscara si no se proporciona
    const phoneMask = mask || await getPhoneMask();
    
    // Aplicar máscara según el formato
    switch (phoneMask) {
      case '999 99 99 99':
        return cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      case '999 999 999':
        return cleanNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
      case '999999999':
        return cleanNumber;
      default:
        return cleanNumber;
    }
  } catch (error) {
    console.error('Error al aplicar máscara de teléfono:', error);
    return phoneNumber; // Devuelve el número original en caso de error
  }
};

/**
 * Valida si un número de teléfono cumple con la máscara configurada
 * @param {string} phoneNumber - Número de teléfono a validar
 * @param {string} mask - Máscara contra la que validar (opcional)
 * @returns {Promise<boolean>} True si es válido, false si no
 */
const validatePhoneNumber = async (phoneNumber, mask = null) => {
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const phoneMask = mask || await getPhoneMask();
    
    // Validar longitud según la máscara
    switch (phoneMask) {
      case '999 99 99 99':
        return cleanNumber.length === 9;
      case '999 999 999':
        return cleanNumber.length === 9;
      case '999999999':
        return cleanNumber.length === 9;
      default:
        return cleanNumber.length === 9;
    }
  } catch (error) {
    console.error('Error al validar número de teléfono:', error);
    return false;
  }
};

/**
 * Middleware para Express que añade la máscara de teléfono a la respuesta
 */
const phoneMaskMiddleware = async (req, res, next) => {
  try {
    req.phoneMask = await getPhoneMask();
    next();
  } catch (error) {
    console.error('Error en middleware de máscara de teléfono:', error);
    req.phoneMask = '999 99 99 99'; // Máscara por defecto
    next();
  }
};

module.exports = {
  getPhoneMask,
  applyPhoneMask,
  validatePhoneNumber,
  phoneMaskMiddleware
};
