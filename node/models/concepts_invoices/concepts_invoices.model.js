const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const PaymentPeriod = require("../payment_period/payment_period.model");

const ConceptsInvoices = sequelize.define("concepts_invoices", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pvp: {
    type: DataTypes.DOUBLE,
  },
  pvp2: {
    type: DataTypes.DOUBLE,
  },
  payment_period_id: {
    type: DataTypes.INTEGER,
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
});

ConceptsInvoices.belongsTo(PaymentPeriod, { foreignKey: "payment_period_id" });
module.exports = ConceptsInvoices;
