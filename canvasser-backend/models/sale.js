const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Sale', {
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deviceModel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    hooks: {
      beforeCreate: (sale, options) => {
        console.log('Attempting to create sale:', sale.toJSON());
      },
      afterCreate: (sale, options) => {
        console.log('Sale created successfully:', sale.toJSON());
      }
    }
  });
};