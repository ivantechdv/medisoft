const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const Relation = sequelize.define("relations", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
    allowNull: true,
  },
});

module.exports = Relation;
