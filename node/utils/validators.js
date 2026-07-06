const { Op } = require("sequelize");

const Validators = async (
  Model,
  dataToValidate = {},
  currentId = null,
  compositeFields = []
) => {
  console.log("🧪 Data a validar:", dataToValidate);

  const duplicatedFields = [];

  // Primero verificamos campos compuestos
  if (compositeFields.length > 0) {
    const compositeWhere = {
      [Op.and]: compositeFields.map((field) => ({
        [field]: dataToValidate[field],
      })),
    };
    if (currentId) compositeWhere.id = { [Op.not]: currentId };

    const compositeExists = await Model.findOne({ where: compositeWhere });
    if (compositeExists) {
      duplicatedFields.push(compositeFields.join("+"));
    }
  }

  // Luego verificamos cada campo individual, excepto los de compositeFields
  for (const [field, value] of Object.entries(dataToValidate)) {
    if (compositeFields.includes(field)) continue;
    if (value == null) continue;

    const where = { [field]: value };
    if (currentId) where.id = { [Op.not]: currentId };

    const exists = await Model.findOne({ where });
    if (exists) {
      duplicatedFields.push(field);
    }
  }

  console.log("⚠️ Campos duplicados encontrados:", duplicatedFields);

  return duplicatedFields.length ? duplicatedFields : null;
};

const isTruthy = (value) =>
  value === true || value === 1 || value === "1" || value === "true";

const hasValue = (value) => value != null && String(value).trim() !== "";

const validateEmployeeReference = (data = {}) => {
  const errors = [];
  const isCurrent = isTruthy(data.is_current);

  if (!hasValue(data.from_date)) {
    errors.push("La fecha de inicio (from_date) es obligatoria");
  }

  if (!isCurrent && !hasValue(data.until_date)) {
    errors.push(
      "La fecha de fin (until_date) es obligatoria cuando la referencia no es actual"
    );
  }

  return errors;
};

module.exports = Validators;
module.exports.validateEmployeeReference = validateEmployeeReference;
