'use strict';

const config = require('config');
const mongoose = require('mongoose');
const log = require('../logger/logger.js').getLog('ingredient_model.js');

class MongoDBConnectionFactory {

  async getConnection() {
    /**
     * factory function: creates a connection to the configured mongo-db
     * and references it as a state. Won't create a new connection if the state is already
     * referenced. Returns the created connection or the state connection.
     */
    if (!this.conn) {
      try {
        await mongoose.connect('mongodb://' + config.get('db.host') + ':' +
            config.get('db.port'), {useMongoClient: true,
          user: config.get('db.user'), pass: config.get('db.pw')});
        this.conn = mongoose.connection;
      } catch (err) {
        this.conn = null;
        console.error(err);
        log.error(err);
        throw err;
      }
    }
    return this.conn;
  }

  async closeConnection() {
    /**
     * closes the state connection if one has been referenced. Returns true
     * if a connection has been closed, else false
     */
    if (this.conn) {
      await this.conn.close();
      this.conn = null;
      return true;
    } else {
      return false;
    }
  }

}

const connectionFactory = new MongoDBConnectionFactory();

module.exports = {
  connectionFactory,
};
