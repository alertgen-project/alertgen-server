'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const log = require('../logger/logger.js').getLog('ingredient_model.js');
const {connectionFactory} = require('./connection_factory');

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

const ingredientSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
  },
  gluten: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  crustaceans: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  eggs: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  fish: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  peanuts: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  soy: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  milk: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  nuts: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  celery: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  mustard: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  sesame: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  sulphites: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  lupin: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
  molluscs: {
    contains: Boolean,
    contains_percent: {
      type: Number,
      min: 0,
      max: 1,
    },
    contains_pos: Number,
    contains_neg: Number,
  },
}, {runSettersOnQuery: true});

/**
 *
 * @param name
 * @param allergen
 * @param field
 * @returns {Promise<void>}
 */
ingredientSchema.statics.updateIngredientAllergenConfirmation = async function(
    name, allergen, field) {
  const ingredient = await this.find({name: new RegExp(name, 'i')});
  if (ingredient[allergen] === undefined || ingredient.length === 0) {
    return Promise.resolve(false);
  }
  ingredient[allergen][field] += 1;
  ingredient[allergen].contains_percent = calcContainsPercentage(
      ingredient[allergen].contains_neg, ingredient[allergen].contains_pos);
  ingredient[allergen].contains = ingredient[allergen].contains_percent >=
      0.5;
  log.info('Updated ingredient to: ' + ingredient);
  return await ingredient.save();
};

/**
 * Tries to insert passed object into the database
 * @param object
 * @returns {Promise<*>}
 */
async function insert(object) {
  const model = await getIngredientsModel();
  return await model.create(object);
}

async function removeOne(object) {
  const model = await getIngredientsModel();
  return await model.findOneAndRemove(object);
}

async function findOne(object) {
  const model = await getIngredientsModel();
  return await model.findOne(object);
}

async function findOneIngredientFuzzy(name) {
  const model = await getIngredientsModel();
  return await model.findOne({name: new RegExp(name, 'i')});
}

async function findByName(name) {
  const model = await getIngredientsModel();
  return await model.find({name: new RegExp(name, 'i')});
}

async function updateIngredientAllergenConfirmation(name, allergen, field) {
  const model = await getIngredientsModel();
  return await model.updateIngredientAllergenConfirmation(name, allergen,
      field);
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
  updateIngredientAllergenConfirmation,
};
