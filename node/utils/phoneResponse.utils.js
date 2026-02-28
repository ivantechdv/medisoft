const { applyPhoneMask } = require("./phoneMask.utils");

/**
 * Aplica la máscara de teléfono a todos los registros de una respuesta
 * @param {Array|Object} data - Datos a procesar (array u objeto)
 * @param {Array} phoneFields - Campos que contienen números de teléfono
 * @returns {Array|Object} Datos con teléfonos formateados
 */
const formatPhoneNumbers = async (data, phoneFields = ['phone', 'code_phone']) => {
  if (!data) return data;
  
  const formatPhone = async (item) => {
    if (!item) return item;
    
    const formattedItem = { ...item };
    
    // Aplicar máscara a cada campo de teléfono
    for (const field of phoneFields) {
      if (formattedItem[field]) {
        formattedItem[field] = await applyPhoneMask(formattedItem[field]);
      }
    }
    
    // Aplicar recursivamente a relaciones anidadas
    for (const key in formattedItem) {
      if (formattedItem[key] && typeof formattedItem[key] === 'object') {
        if (Array.isArray(formattedItem[key])) {
          formattedItem[key] = await formatPhoneNumbers(formattedItem[key], phoneFields);
        } else {
          formattedItem[key] = await formatPhoneNumbers(formattedItem[key], phoneFields);
        }
      }
    }
    
    return formattedItem;
  };
  
  if (Array.isArray(data)) {
    return Promise.all(data.map(formatPhone));
  } else {
    return formatPhone(data);
  }
};

/**
 * Middleware para Express que formatea los números de teléfono en la respuesta
 * @param {Array} phoneFields - Campos que contienen números de teléfono
 */
const phoneFormatMiddleware = (phoneFields = ['phone', 'code_phone']) => {
  return async (req, res, next) => {
    // Guardar el método res.json original
    const originalJson = res.json;
    
    // Sobrescribir res.json para formatear los teléfonos antes de enviar la respuesta
    res.json = async function(data) {
      try {
        const formattedData = await formatPhoneNumbers(data, phoneFields);
        return originalJson.call(this, formattedData);
      } catch (error) {
        console.error('Error al formatear números de teléfono:', error);
        return originalJson.call(this, data); // Enviar datos originales si hay error
      }
    };
    
    next();
  };
};

module.exports = {
  formatPhoneNumbers,
  phoneFormatMiddleware
};
