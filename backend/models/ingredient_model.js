'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('config');
const log = require('../logger/logger.js').getLog('ingredient_model.js');
const conn = mongoose.connect('mongodb://' + config.get('db.user') + ':' +
    config.get('db.pw') + '@' + config.get('db.host') + ':' +
    config.get('db.port'),
    {useMongoClient: true});
// use ES6 native Promises
mongoose.Promise = Promise;

const ingredientSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
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
  const ingredient = await this.find({name: new RegExp(name, 'i')});
  return new Promise((resolve) => {
    if (ingredient[allergen] === undefined || ingredient.length === 0) {
      resolve(false);
    }
    ingredient[allergen][field] += 1;
    if (field === 'contains_pos') {
      ingredient[allergen].contains_percent = ingredient[allergen][field] /
          (ingredient[allergen][field] + ingredient[allergen].contains_neg);
      ingredient[allergen].contains = ingredient[allergen].contains_percent >=
          0.5;
    }
    else {
      ingredient[allergen].contains_percent = ingredient[allergen][field] /
          (ingredient[allergen][field] + ingredient[allergen].contains_pos);
      ingredient[allergen].contains = ingredient[allergen].contains_percent >=
          0.5;
    }
    log.info('Updated ingredient to: ' + ingredient);
    ingredient.save(function(err) {
      if (err) resolve(false);
      else return resolve(true);
    });
  });
};

ingredientSchema.statics.insert = async function(
    object) {
  return new Promise((resolve) => {
    this.create(object, (err) => {
      if (err) {
        log.error(err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

ingredientSchema.statics.removeOne = async function(
    object) {
  return new Promise((resolve) => {
    this.findOneAndRemove(object, (err) => {
      if (err) {
        log.error(err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

ingredientSchema.statics.findOneIngredient = async function(
    object) {
  return new Promise((resolve) => {
    this.findOne(object, (err, object) => {
      if (err) {
        log.error(err);
        resolve(undefined);
      } else {
        resolve(object);
      }
    });
  });
};

module.exports = conn.model('Ingredient', ingredientSchema);
