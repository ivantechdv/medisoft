const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const EmployeeSpecific = sequelize.define(
  "employee_specific",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
    },
    services: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tasks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    patologies: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experiences: {
      type: DataTypes.STRING,
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
  },
  {
    tableName: "employee_specific",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = EmployeeSpecific;
