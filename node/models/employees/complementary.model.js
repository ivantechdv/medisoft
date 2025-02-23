const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const EmployeeComplementary = sequelize.define(
  "employee_complementary",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
    },
    driving_license: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    own_vehicle: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    language_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cook_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    educational_level_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    time_experience_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    official_qualification_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    consent_contact: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    date_consent: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    accept_conditions: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    date_condition: {
      type: DataTypes.DATEONLY,
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
    tableName: "employee_complementary",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = EmployeeComplementary;
