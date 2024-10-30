const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const CodPost = require("../cod_posts/cod_posts.model");

const Client = sequelize.define("clients", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dni: {
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
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  dniFront: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  dniBack: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  cod_post_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  origen_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  language_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  code_phone: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  final_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  born_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: sequelize.literal("CURRENT_DATE"),
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  type: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

Client.belongsTo(CodPost, { foreignKey: "cod_post_id" });
CodPost.hasMany(Client, { foreignKey: "cod_post_id" });
module.exports = Client;
