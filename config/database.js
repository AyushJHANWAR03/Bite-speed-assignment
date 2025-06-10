const { Sequelize } = require('sequelize');

// Use SQLite for development
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // File-based SQLite DB
  logging: false // Disable logging for cleaner console output
});

module.exports = sequelize; 