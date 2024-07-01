const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const Client = require("../clients/clients.model");
const Employee = require("../employees/employees.model");
const Service = require("../services/services.model");
const ClientStatuReason = require("../clients_statu_reasons/clients_statu_reasons.model");

const ClientsServices = sequelize.define("clients_services", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  client_statu_reason_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  has_offer: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
  },
  offer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_deleted: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
  },
  observation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  detail_end: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  service_demand: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  service_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  service_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  statu: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
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

ClientsServices.belongsTo(Client, { foreignKey: "client_id" });
ClientsServices.belongsTo(ClientStatuReason, {
  foreignKey: "client_statu_reason_id",
});
ClientsServices.belongsTo(Service, { foreignKey: "service_id" });
Client.hasMany(ClientsServices, { foreignKey: "client_id" });
ClientsServices.belongsTo(Employee, { foreignKey: "employee_id" });
Service.hasMany(ClientsServices, { foreignKey: "service_id" });
ClientsServices.belongsTo(Service, { foreignKey: "service_id" });

module.exports = ClientsServices;
