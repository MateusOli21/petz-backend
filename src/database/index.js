const Sequelize = require('sequelize');

const databaseConfig = require('../config/database');

const User = require('../app/models/User');
const File = require('../app/models/File');
const Pet = require('../app/models/Pet');
const Establishment = require('../app/models/Establishment');
const Service = require('../app/models/Service');

const models = [User, File, Pet, Establishment, Service];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

module.exports = new Database();
