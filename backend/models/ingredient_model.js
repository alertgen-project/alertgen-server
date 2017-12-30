'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const log = require('../logger/logger.js').getLog('ingredient_model.js');
const {connectionFactory} = require('./connection_factory');
const contains_pos = 'contains_pos';
const contains_neg = 'contains_neg';
const AsyncLock = require('async-lock');
const lock = new AsyncLock();

// use ES6 native Promises
mongoose.Promise = Promise;


const allergenAttributes = {
  contains: {
    type: Boolean,
    default: false,
  },
  contains_percent: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  contains_pos: {
    type: Number,
    default: 0,
  },
  contains_neg: {
    type: Number,
    default: 0,
  },
};

const allergens = [
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soy',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs'];
const schema = {
  name: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
  },
};
allergens.forEach(allergen => {
  schema[allergen] = allergenAttributes;
});
const ingredientSchema = new Schema(schema, {runSettersOnQuery: true});

/**
 * Function calculates the percentage of containing allergen with the negative and positive confirmations
 * @param contains_neg
 * @param contains_pos
 * @returns {number}
 */
const calcContainsPercentage = (contains_neg, contains_pos) => {
  return contains_pos / (contains_pos + contains_neg);
};

/**
 * Finds documents in mongoDb by name
 * @param {string} name - name of ingredient
 * @returns {Promise<Query|void|*|number>}
 */
ingredientSchema.statics.findByName = async function(name) {
  try {
    return this.find({name: new RegExp(name, 'i')});
  }
  catch (err) {
    log.error(err);
  }
};

/**
 * updates confirmations of ingredient containing an allergen
 * field means the string of contains_neg or contains_pos to know if it's a negative oder positive confirmation
 * function needed for help_us route
 * @param {string} name - name of ingredient
 * @param {string} allergen - name of allergen
 * @param {string} field - 'contains_pos' or 'contains_neg'
 * @returns {Promise<void>}
 */
ingredientSchema.statics.updateIngredientAllergenConfirmation = async function(
    name, allergen, field) {
  return await lock.acquire('ingredientUpdate', async () => {
    const ingredient = await this.findOneIngredientFuzzy(name);
    if (!ingredient || !ingredient[allergen]) {
      return false;
    }
    ingredient[allergen][field] += 1;
    ingredient[allergen].contains_percent = calcContainsPercentage(
        ingredient[allergen].contains_neg, ingredient[allergen].contains_pos);
    ingredient[allergen].contains = ingredient[allergen].contains_percent >=
        0.5;
    log.info('Updated ingredient to: ' + ingredient);
    return await ingredient.save();
  });
};

/**
 * inserts document in ingredient collection
 * @param {Object} object - object to insert
 * @returns {Promise<*>}
 */
ingredientSchema.statics.insert = async function(
    object) {
  return await this.create(object);
};
/**
 * removes the first matching object from ingredient collection
 * @param {Object} object - object to remove
 * @returns {Promise<*>}
 */
ingredientSchema.statics.removeOne = async function(
    object) {
  return await this.findOneAndRemove(object);
};
/**
 * finds and returns the first matching object with @param object
 * @param {Object} object - object to find
 * @returns {Promise<*>}
 */
ingredientSchema.statics.findOneIngredient = async function(
    object) {
  return await this.findOne(object);
};
/**
 * finds and returns the first matching object with same name as @param name
 * @param {string} name - name of ingredient to find
 * @returns {Promise<*>}
 */
ingredientSchema.statics.findOneIngredientFuzzy = async function(
    name) {
  return await this.findOne({name: new RegExp(name, 'i')});
};

/**
 * Retrieves the ingredientModel with a applied connection.
 * tries to insert the passed document afterwards.
 * @param {Object} document document to insert
 * @returns {Promise<*>}
 */
async function insert(document) {
  const model = await getIngredientsModel();
  return await model.insert(document);
}

/**
 * Retrieves the ingredientModel with a applied connection and removes
 * a passed document with the help of the model.
 * @param {Object} document document to remove
 * @returns {Promise<*>} the removed document
 */
async function removeOne(document) {
  const model = await getIngredientsModel();
  return await model.removeOne(document);
}

/**
 * Retrieves the ingredientModel with a applied connection and finds
 * a document which is like the passed object with the help of the model.
 * @param {Object} object used to find the document .
 * @returns {Promise<*>} the found document
 */
async function findOne(object) {
  const model = await getIngredientsModel();
  return await model.findOneIngredient(object);
}

/**
 * Retrieves the ingredientModel with a applied connection and finds
 * a document which has the passed name with the help of the model.
 * @param {string} name of the document to find
 * to find the document
 * @returns {Promise<*>} the found document
 */
async function findOneIngredientFuzzy(name) {
  const model = await getIngredientsModel();
  return await model.findOneIngredientFuzzy(name);
}

async function findByName(name) {
  const model = await getIngredientsModel();
  return await model.findByName(name);
}

/**
 * Retrieves the ingredientModel with a applied connection and updates
 * an allergen of a document which has the passed name with the help of the model.
 * @param {string} name of the document to find
 * @param {string} allergen name of the allergen in the found document to update
 * @param {string} field field to increase. Possible values are contains_pos and contains_neg
 * to find the document
 * @returns {Promise<*>} the updated document or false if the document was not found
 */
async function updateIngredientAllergenConfirmation(name, allergen, field) {
  const model = await getIngredientsModel();
  return await model.updateIngredientAllergenConfirmation(name, allergen,
      field);
}

/**
 * Retrieves the ingredientModel with a applied connection and updates
 * an allergen of a document which has the passed name with the help of the model.
 * Increases the field contains_pos of the allergen with the passed name.
 * @param name of the document to find
 * @param allergen name of the allergen in the found document to update
 * @returns {Promise<*>} the updated document or false if the document was not found
 */
async function increaseIngredientAllergen(ingredient, allergen) {
  const model = await getIngredientsModel();
  return await model.updateIngredientAllergenConfirmation(ingredient, allergen,
      contains_pos);
}

/**
 * Retrieves the ingredientModel with a applied connection and updates
 * an allergen of a document which has the passed name with the help of the model.
 * Increases the field contains_neg of the allergen with the passed name.
 * @param name of the document to find
 * @param allergen name of the allergen in the found document to update
 * to find the document
 * @returns {Promise<*>} the updated document or false if the document was not found
 */
async function decreaseIngredientAllergen(ingredient, allergen) {
  const model = await getIngredientsModel();
  return await model.updateIngredientAllergenConfirmation(ingredient, allergen,
      contains_neg);
}

/**
 * Retrieves a connection and returns a IngredientsModel which has the connection
 * applied to it.
 * @returns {Promise<void>}
 */
async function getIngredientsModel() {
  try {
    const connection = await connectionFactory.getConnection();
    return connection.model('Ingredient', ingredientSchema);
  } catch (err) {
    log.error(err);
    throw err;
  }
}

module.exports = {
  insert,
  findByName,
  removeOne,
  findOne,
  findOneIngredientFuzzy,
  updateIngredientAllergenConfirmation,
  increaseIngredientAllergen,
  decreaseIngredientAllergen,
  allergens,
  Ingredient: mongoose.model('Ingredient', ingredientSchema),
};
