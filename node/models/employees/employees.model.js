const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const CodPost = require("../cod_posts/cod_posts.model");
const EmployeeSpecific = require("./specific.model");
const EmployeeComplementary = require("./complementary.model");
const Gender = require("../genders/genders.model");

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
    dniFront: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    dniBack: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gender_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cod_post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    born_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dni: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
     dni_date_expiration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    num_social_security: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    code_phone: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    code_phone2: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    phone2: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 0,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address_num: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address_flat: {
      type: DataTypes.TEXT,
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
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    level_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    statu_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
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
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "employees",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

Employee.belongsTo(CodPost, { foreignKey: "cod_post_id" });
CodPost.hasMany(Employee, { foreignKey: "cod_post_id" });
Employee.hasOne(EmployeeSpecific, { foreignKey: "employee_id" });
Employee.hasOne(EmployeeComplementary, { foreignKey: "employee_id" });
Employee.belongsTo(Gender, { foreignKey: "gender_id" });
Gender.hasMany(Employee, { foreignKey: "gender_id" });
module.exports = Employee;
