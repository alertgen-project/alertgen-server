'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const log = require('../logger/logger.js').getLog('ingredient_model.js');

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
  return this.find({name: new RegExp(name, 'i')});
};

/**
 *
 * @param name
 * @param allergen
 * @param field
 * @returns {Promise<void>}
 */
ingredientSchema.statics.updateIngredientAllergenConfirmation = async (
    name, allergen, field) => {
  try {
    const ingredient = await this.find({name: new RegExp(name, 'i')});
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
    return await ingredient.save();
  }
  catch (err) {
    log.error(err);
  }
};

module.exports = mongoose.model('Ingredient', ingredientSchema);
