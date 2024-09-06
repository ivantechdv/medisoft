const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const EmployeeFilter = sequelize.define(
  "employee_filter", // Nombre de la tabla
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    field_value: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    field: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model_relation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    condition: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    statu: {
      type: DataTypes.STRING(100),
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
    tableName: "employee_filter", // Nombre de la tabla
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = EmployeeFilter;
