const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const User = require("../users/users.model");

const EventLogs = sequelize.define("eventlogs", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  creator_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  creator_company: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  creator_department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  module: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  changes: {
    type: DataTypes.JSON,
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

// Define la relación con la tabla de usuarios
EventLogs.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

module.exports = EventLogs;
