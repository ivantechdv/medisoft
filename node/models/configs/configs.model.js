const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const Country = require("../countries/countries.model");

const Config = sequelize.define("configs", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phone_mask: {
    type: DataTypes.ENUM('999 99 99 99', '999 999 999', '999999999'),
    allowNull: false,
    defaultValue: '999 99 99 99',
  },
  default_country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries',
      key: 'id'
    }
  },
  client_config: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      types: [],
      languages: []
    }
  },
  employee_config: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      types: [],
      levels: [],
      languages: []
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
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

Config.belongsTo(Country, { foreignKey: "default_country_id", as: 'defaultCountry' });
Country.hasMany(Config, { foreignKey: "default_country_id" });

module.exports = Config;
