const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const Family = sequelize.define("families", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(30),
    allowNull: true,
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
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  send_invoice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  send_comunication: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Family;
