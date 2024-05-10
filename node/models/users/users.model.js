const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

// Define the User model
const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dni: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    first_name: {
        type: DataTypes.STRING(90),
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING(90),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    direction: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    avatar: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rol_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
});

module.exports = User;
