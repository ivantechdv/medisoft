const { Sequelize } = require("sequelize");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 30000,
    },
    /*  dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.resolve(__dirname + process.env.File_Root))
      }
    } */
});

module.exports = sequelize;