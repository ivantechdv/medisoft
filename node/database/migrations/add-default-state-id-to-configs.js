const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('configs', 'default_state_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('configs', 'default_state_id');
  }
};
