const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const Country = sequelize.define("countries", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code_phone: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone_format: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Formato E.164 del número de teléfono (ej: 999999999)',
  },
  phone_mask: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Máscara visual del número de teléfono (ej: 999 99 99 99)',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
});

module.exports = Country;
