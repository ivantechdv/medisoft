const CTRL = {};
const { getPhoneMask, applyPhoneMask, validatePhoneNumber } = require("../../utils/phoneMask.utils");

/**
 * Obtiene la máscara de teléfono configurada
 */
CTRL.getMask = async (req, res, next) => {
  try {
    const mask = await getPhoneMask();
    res.json({ phoneMask: mask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Aplica la máscara de teléfono a un número proporcionado
 */
CTRL.applyMask = async (req, res, next) => {
  try {
    const { phoneNumber, mask } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber es requerido" });
    }
    
    const formattedPhone = await applyPhoneMask(phoneNumber, mask);
    res.json({ 
      original: phoneNumber,
      formatted: formattedPhone 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Valida un número de teléfono según la máscara configurada
 */
CTRL.validatePhone = async (req, res, next) => {
  try {
    const { phoneNumber, mask } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber es requerido" });
    }
    
    const isValid = await validatePhoneNumber(phoneNumber, mask);
    res.json({ 
      phoneNumber,
      isValid 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = CTRL;
