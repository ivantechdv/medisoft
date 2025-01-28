const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const Client = require("../clients/clients.model");
const Employee = require("../employees/employees.model");
const Service = require("../services/services.model");
const ClientsServices = require("../clients_services/clients_services.model");

const ClientsServicesPreselections = sequelize.define(
  "clients_services_preselections",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Pendiente",
    },
    client_service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    observation: {
      type: DataTypes.STRING,
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
  }
);

ClientsServicesPreselections.belongsTo(Client, { foreignKey: "client_id" });
ClientsServicesPreselections.belongsTo(Service, { foreignKey: "service_id" });
ClientsServicesPreselections.belongsTo(ClientsServices, {
  foreignKey: "client_service_id",
});
ClientsServices.hasMany(ClientsServicesPreselections, {
  foreignKey: "client_service_id",
});
Client.hasMany(ClientsServicesPreselections, { foreignKey: "client_id" });
ClientsServicesPreselections.belongsTo(Employee, { foreignKey: "employee_id" });
Service.hasMany(ClientsServicesPreselections, { foreignKey: "service_id" });
ClientsServicesPreselections.belongsTo(Service, { foreignKey: "service_id" });

module.exports = ClientsServicesPreselections;
