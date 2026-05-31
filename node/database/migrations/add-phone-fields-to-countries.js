const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('countries', 'phone_format', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Formato E.164 del número de teléfono (ej: 999999999)',
      after: 'name'
    });

    await queryInterface.addColumn('countries', 'phone_mask', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Máscara visual del número de teléfono (ej: 999 99 99 99)',
      after: 'phone_format'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('countries', 'phone_mask');
    await queryInterface.removeColumn('countries', 'phone_format');
  }
};
