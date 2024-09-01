//arquivo gerado automaticamente pelo sequelize, porem eu pedi pro
//GPT adaptar o mesmo arquivo para uma versao mais legivel

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    // You can define custom methods here if needed
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User'
  });

  return User;
};
