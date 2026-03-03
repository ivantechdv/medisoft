const { applyPhoneMask } = require("../utils/phoneMask.utils");

/**
 * Middleware global que aplica la máscara de teléfono a todas las respuestas
 */
const globalPhoneFormat = (req, res, next) => {
  // Guardar el método res.json original
  const originalJson = res.json;
  
  // Sobrescribir res.json para formatear los teléfonos
  res.json = function(data) {
    // Función síncrona para formatear teléfonos
    const formatPhonesSync = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => formatPhonesSync(item));
      }
      
      const formattedObj = {};
      let phonesFound = 0;
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          
          // Si es un campo de teléfono, aplicar formato simple
          if (typeof value === 'string' && 
              (key === 'phone' || key === 'phone2' || key === 'code_phone' || key === 'code_phone2')) {
            phonesFound++;
            // Aplicar formato síncrono básico
            const cleanNumber = value.replace(/\D/g, '');
            if (cleanNumber.length === 9) {
              formattedObj[key] = cleanNumber.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
            } else {
              formattedObj[key] = value;
            }
          }
          // Si es un objeto o array, aplicarle recursivamente
          else if (value && typeof value === 'object') {
            formattedObj[key] = formatPhonesSync(value);
          }
          // Si no, mantener el valor original
          else {
            formattedObj[key] = value;
          }
        }
      }
      
      if (phonesFound > 0) {
        console.log(`📞 Found and formatted ${phonesFound} phone numbers`);
      }
      
      return formattedObj;
    };
    
    try {
      const formattedData = formatPhonesSync(data);
      return originalJson.call(this, formattedData);
    } catch (error) {
      console.error('❌ Error al formatear números de teléfono:', error);
      return originalJson.call(this, data);
    }
  };
  
  next();
};

module.exports = globalPhoneFormat;
