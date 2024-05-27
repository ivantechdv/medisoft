const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const Country = require("../countries/countries.model");

const State = sequelize.define("states", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  country_id: {
    type: DataTypes.INTEGER,
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
State.belongsTo(Country, { foreignKey: "country_id" });
Country.hasMany(State, { foreignKey: "country_id" });
module.exports = State;
