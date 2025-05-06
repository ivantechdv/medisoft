const { Op } = require("sequelize");

const Validators = async (
  Model,
  dataToValidate = {},
  currentId = null,
  compositeFields = []
) => {
  const orConditions = Object.entries(dataToValidate).map(([field, value]) => ({
    [field]: value,
  }));

  // Agregar condición compuesta combinada (AND)
  if (compositeFields.length > 0) {
    orConditions.push({
      [Op.and]: compositeFields.map((field) => ({
        [field]: dataToValidate[field],
      })),
    });
  }

  const whereCondition = {
    [Op.or]: orConditions,
  };

  if (currentId) {
    whereCondition.id = { [Op.not]: currentId };
  }

  const existingRecord = await Model.findOne({ where: whereCondition });

  if (!existingRecord) return null;

  const duplicatedFields = [];

  // Excluir los campos que están en combinaciones
  for (const [field, value] of Object.entries(dataToValidate)) {
    if (!compositeFields.includes(field) && existingRecord[field] === value) {
      duplicatedFields.push(field);
    }
  }

  // Verificar si la combinación completa ya existe
  if (
    compositeFields.length > 0 &&
    compositeFields.every(
      (field) => existingRecord[field] === dataToValidate[field]
    )
  ) {
    duplicatedFields.push(compositeFields.join("+")); // Ej: code_phone+phone
  }

  return duplicatedFields.length ? duplicatedFields : null;
};

module.exports = Validators;
