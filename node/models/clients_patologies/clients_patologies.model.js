const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const Client = require("../clients/clients.model");
const Patology = require("../patologies/patologies.model");

const ClientPatology = sequelize.define("clients_patologies", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patology_id: {
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
});

ClientPatology.belongsTo(Client, { foreignKey: "client_id" });
Client.hasMany(ClientPatology, { foreignKey: "client_id" });
ClientPatology.belongsTo(Patology, { foreignKey: "patology_id" });
Patology.hasMany(ClientPatology, { foreignKey: "patology_id" });

module.exports = ClientPatology;
