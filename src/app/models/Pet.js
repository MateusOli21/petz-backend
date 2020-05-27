const Sequelize = require('sequelize');
const { Model } = require('sequelize');

class Pet extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        age: Sequelize.INTEGER,
        sex: Sequelize.STRING,
        weight: Sequelize.INTEGER,
        castred: Sequelize.BOOLEAN,
        comments: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }
}

module.exports = Pet;
