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
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  photo: {
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
  phone: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATE,
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
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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
