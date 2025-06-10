const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  email: { 
    type: DataTypes.STRING, 
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  linkedId: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: {
      model: 'Contacts',
      key: 'id'
    }
  },
  linkPrecedence: { 
    type: DataTypes.ENUM('primary', 'secondary'), 
    defaultValue: 'primary' 
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, { 
  timestamps: true,
  paranoid: true // Enables soft deletes
});

module.exports = Contact; 