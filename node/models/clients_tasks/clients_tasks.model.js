const { DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const Client = require("../clients/clients.model");
const Task = require("../employees/task.model");

const ClientTask = sequelize.define("clients_tasks", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

ClientTask.belongsTo(Client, { foreignKey: "client_id" });
Client.hasMany(ClientTask, { foreignKey: "client_id" });
ClientTask.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(ClientTask, { foreignKey: "task_id" });

module.exports = ClientTask;
