const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const User = require("../users/users.model");

const UserPreference = sequelize.define("user_preferences", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  entity: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: "Nombre de la lista/tabla (clients, employees, services, etc.)",
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: "Preferencias de ordenación y filtros (ej: { sorting: [{ id: 'id', desc: true }] })",
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

UserPreference.associate = (models) => {
  UserPreference.belongsTo(models.users, {
    foreignKey: "user_id",
    as: "user",
  });
};

module.exports = UserPreference;
