const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const Client = require("../clients/clients.model");
const ClientService = require("../clients_services/clients_services.model");
const ConceptsInvoices = require("../concepts_invoices/concepts_invoices.model");

const ClientsInvoices = sequelize.define("clients_invoices", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Client,
      key: "id",
    },
  },
  client_service_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: ClientService,
      key: "id",
    },
  },
  concept_invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: ConceptsInvoices,
      key: "id",
    },
  },
  period: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  base: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  next_payment: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  service_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  pvp: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  discount: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  total: {
    type: DataTypes.DOUBLE,
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
  service_end: { type: DataTypes.DATE, allowNull: true },
  client_statu_reason_id: { type: DataTypes.INTEGER, allowNull: true },
  detail_end: { type: DataTypes.STRING, allowNull: true },
});

ClientsInvoices.belongsTo(Client, { foreignKey: "client_id" });
ClientsInvoices.belongsTo(ClientService, { foreignKey: "client_service_id" });
ClientsInvoices.belongsTo(ConceptsInvoices, {
  foreignKey: "concept_invoice_id",
});

module.exports = ClientsInvoices;
