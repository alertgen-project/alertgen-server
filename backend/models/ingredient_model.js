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

/**
 *
 * @param contains_neg
 * @param contains_pos
 * @returns {number}
 */
const calcContainsPercentage = (contains_neg, contains_pos) => {
  return contains_pos / (contains_pos + contains_neg);
};

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
const schemaObject = {
  name: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
  },
};
allergens.forEach(allergen => {
  schemaObject[allergen] = allergenAttributes;
});
const ingredientSchema = new Schema(schemaObject, {runSettersOnQuery: true});

/**
 *
 * @param name
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
 *
 * @param name
 * @param allergen
 * @param field
 * @returns {Promise<void>}
 */
ingredientSchema.statics.updateIngredientAllergenConfirmation = async function(
    name, allergen, field) {
  return await lock.acquire('test', async () => {
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

ingredientSchema.statics.insert = async function(
    object) {
  return await this.create(object);
};

ingredientSchema.statics.removeOne = async function(
    object) {
  return await this.findOneAndRemove(object);
};

ingredientSchema.statics.findOneIngredient = async function(
    object) {
  return await this.findOne(object);
};

ingredientSchema.statics.findOneIngredientFuzzy = async function(
    name) {
  return await this.findOne({name: new RegExp(name, 'i')});
};

async function insert(object) {
  const model = await getIngredientsModel();
  return await model.insert(object);
}

async function removeOne(object) {
  const model = await getIngredientsModel();
  return await model.removeOne(object);
}

async function findOne(object) {
  const model = await getIngredientsModel();
  return await model.findOneIngredient(object);
}

async function findOneIngredientFuzzy(name) {
  const model = await getIngredientsModel();
  return await model.findOneIngredientFuzzy(name);
}

async function findByName(name) {
  const model = await getIngredientsModel();
  return await model.findByName(name);
}

async function updateIngredientAllergenConfirmation(name, allergen, field) {
  const model = await getIngredientsModel();
  return await model.updateIngredientAllergenConfirmation(name, allergen,
      field);
}

async function decreaseIngredientAllergen(ingredient, allergen) {
  const model = await getIngredientsModel();
  return await model.updateIngredientAllergenConfirmation(ingredient, allergen,
      contains_neg);
}

async function increaseIngredientAllergen(ingredient, allergen) {
  const model = await getIngredientsModel();
  return await model.updateIngredientAllergenConfirmation(ingredient, allergen,
      contains_pos);
}

async function getIngredientsModel() {
  try {
    const connection = await connectionFactory.getConnection();
    return connection.model('Ingredient', ingredientSchema);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getIngredientsModel, insert, findByName,
  removeOne, findOne, findOneIngredientFuzzy,
  updateIngredientAllergenConfirmation, increaseIngredientAllergen,
  decreaseIngredientAllergen,
};
