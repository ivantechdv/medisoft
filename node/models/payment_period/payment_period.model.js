const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");

const PaymentPeriod = sequelize.define("payment_period", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  calculation_base: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  calculation_unit: {
    type: DataTypes.DOUBLE,
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

//ConceptsInvoices.belongsTo(Payment)
module.exports = PaymentPeriod;
