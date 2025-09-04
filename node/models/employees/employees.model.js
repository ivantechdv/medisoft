const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const CodPost = require("../cod_posts/cod_posts.model");
const EmployeeSpecific = require("./specific.model");
const EmployeeComplementary = require("./complementary.model");
const Gender = require("../genders/genders.model");
const Status = require("./status.model");
const Level = require("./level.model");

const Employee = sequelize.define(
  "employees",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    photo: DataTypes.STRING(100),
    dniFront: DataTypes.STRING(100),
    dniBack: DataTypes.STRING(100),
    first_name: DataTypes.STRING(100),
    last_name: DataTypes.STRING(100),
    full_name: DataTypes.STRING(100),
    gender_id: DataTypes.INTEGER,
    cod_post_id: DataTypes.INTEGER,
    country_id: DataTypes.INTEGER,
    born_date: DataTypes.DATEONLY,
    dni: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        notEmpty(value) {
          if (value === "") throw new Error("DNI no puede estar vacío");
        },
      },
    },
    dni_date_expiration: DataTypes.DATEONLY,
    num_social_security: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        notEmpty(value) {
          if (value === "") throw new Error("NSS no puede estar vacío");
        },
      },
    },
    code_phone: DataTypes.STRING(10),
    phone: DataTypes.STRING(100),
    code_phone2: DataTypes.STRING(10),
    phone2: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty(value) {
          if (value === "") throw new Error("Email no puede estar vacío");
        },
      },
    },
    address: DataTypes.TEXT,
    address_num: DataTypes.TEXT,
    address_flat: DataTypes.TEXT,
    attach_curriculum: DataTypes.STRING(150),
    attach_reference: DataTypes.STRING(150),
    type: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    is_active: DataTypes.BOOLEAN,
    level_id: DataTypes.INTEGER,
    statu_id: DataTypes.INTEGER,
    is_deleted: DataTypes.BOOLEAN,
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
    observations: DataTypes.TEXT,
    ipaddress: DataTypes.TEXT,
  },
  {
    tableName: "employees",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      {
        unique: true,
        fields: ["code_phone", "phone"], // 👈 combinación única
      },
    ],
    validate: {
      // ✅ validación a nivel de modelo
      checkUniqueFields() {
        if (this.dni === "") this.dni = null;
        if (this.email === "") this.email = null;
        if (this.num_social_security === "") this.num_social_security = null;
        if (this.phone === "") this.phone = null;
      },
    },
  }
);

// ==================== HOOK ====================
Employee.addHook("beforeValidate", (employee) => {
  // convertir "" a null en campos únicos
  if (employee.phone === "") employee.phone = null;
  if (employee.dni === "") employee.dni = null;
  if (employee.email === "") employee.email = null;
  if (employee.num_social_security === "") employee.num_social_security = null;

  ["country_id", "gender_id", "cod_post_id", "level_id", "statu_id"].forEach(
    (field) => {
      if (employee[field] === "") employee[field] = null;
    }
  );

  // Campos DATE opcionales
  ["born_date", "dni_date_expiration", "start_date"].forEach((field) => {
    if (!employee[field] || isNaN(new Date(employee[field]).getTime())) {
      employee[field] = null;
    }
  });
});

// Relaciones
Employee.belongsTo(CodPost, { foreignKey: "cod_post_id" });
Employee.belongsTo(Status, { foreignKey: "statu_id" });
Employee.belongsTo(Level, { foreignKey: "level_id" });
CodPost.hasMany(Employee, { foreignKey: "cod_post_id" });
Employee.hasOne(EmployeeSpecific, { foreignKey: "employee_id" });
Employee.hasOne(EmployeeComplementary, { foreignKey: "employee_id" });
Employee.belongsTo(Gender, { foreignKey: "gender_id" });
Gender.hasMany(Employee, { foreignKey: "gender_id" });

module.exports = Employee;
