const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const Service = sequelize.define("services", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  alias: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
   position:{
    type:Number,
  },
  cost: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  concepts_invoices: {
    type: DataTypes.TEXT,
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
    defaultValue:true
  },
});

module.exports = Service;
