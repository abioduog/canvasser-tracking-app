const { Sequelize } = require('sequelize');
const UserModel = require('./user');
const SaleModel = require('./sale');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const User = UserModel(sequelize);
const Sale = SaleModel(sequelize);

User.hasMany(Sale);
Sale.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Sale
};