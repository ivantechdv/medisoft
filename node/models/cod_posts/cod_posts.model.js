const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const CodPost = sequelize.define("cod_posts", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  state_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  name: {
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
});

module.exports = CodPost;
