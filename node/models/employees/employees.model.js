const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const Employee = sequelize.define(
  "employees",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    photo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gender_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    borth_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cod_post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dni: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    num_social_security: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    valid_driving_license: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    own_vehicle: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    cook_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    education_level_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    time_experience_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    attach_curriculum: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    attach_reference: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    detail_task: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    detail_diseases: {
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
  },
  {
    tableName: "employees",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = Employee;
