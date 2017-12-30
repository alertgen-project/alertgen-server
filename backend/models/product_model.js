'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const log = require('../logger/logger.js').getLog('product_model.js');
const {connectionFactory} = require('./connection_factory');

// use ES6 native Promises
mongoose.Promise = Promise;

const productSchema = new Schema({
  barcode: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  ingredients: {
    type: [String],
    required: true,
    lowercase: true,
  },
  categories: {
    type: [String],
    lowercase: true
  }
}, {runSettersOnQuery: true});

/**
 * inserts document in product collection
 * @param {Object} object - object to insert
 * @returns {Promise<*>}
 */
productSchema.statics.insert = async function(
    object) {
  return await this.create(object);
};

/**
 * removes the first document found matching @param object
 * @param {Object} object - object to remove
 * @returns {Promise<*>}
 */
productSchema.statics.removeOne = async function(
    object) {
  return await this.findOneAndRemove(object);
};

/**
 * returns the first document found matching @param object
 * @param {Object} object - object to find
 * @returns {Promise<*>}
 */
productSchema.statics.findOneProduct = async function(
    object) {
  return await this.findOne(object);
};

/**
 * returns the first document where the barcode matches @param barcode
 * @param {string} barcode - barcode of product to find
 * @returns {Promise<*>}
 */
productSchema.statics.findOneProductByBarcode = async function(
    barcode) {
  return await this.findOne({barcode: barcode});
};

/**
 * returns array of products found matching the category of @param category
 * @param {string} category - category of products to find
 * @returns {Promise<*>}
 */
productSchema.statics.findProductsOfCategory = async function (category) {
  return await this.find({categories: new RegExp(category, 'i')})
};

/**
 * establishes connection to mongoDB and returns ProductModel with connection
 * @returns {Promise<void>}
 */
async function getProductModel() {
  try {
    const connection = await connectionFactory.getConnection();
    return connection.model('Product', productSchema);
  } catch (err) {
    log.error(err);
    throw err;
  }
}

async function insert(object) {
  const model = await getProductModel();
  return await model.insert(object);
}

async function removeOne(object) {
  const model = await getProductModel();
  return await model.removeOne(object);
}

async function findOne(object) {
  const model = await getProductModel();
  return await model.findOneProduct(object);
}

async function findOneByBarcode(barcode) {
  const model = await getProductModel();
  return await model.findOneProductByBarcode(barcode);
}

async function findProductsOfCategory(category) {
  const model = await getProductModel();
  return await model.findProductsOfCategory(category);
}

module.exports = {
  insert, removeOne, findOne, findOneByBarcode, findProductsOfCategory
};