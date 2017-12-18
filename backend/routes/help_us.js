'use strict';

module.exports = {
  postFeedback,
};

const HelpUsErrors = require('../errors/help_us_errors.js');
const log = require('../logger/logger.js').getLog('help_us.js');
const IngredientsModel = require('../models/ingredient_model.js');

async function postFeedback(ctx, next) {
  if (!ctx.query.ingredient || !ctx.query.allergen || !ctx.query.increase) {
    ctx.throw(new HelpUsErrors.HelpUsWrongParameterError());
  }
  const ingredient = ctx.query.ingredient;
  const allergen = ctx.query.allergen;
  const increase = ctx.query.increase;
  log.debug('Using Queryparameters:', ingredient, allergen);

  if (increase) {
    IngredientsModel.updateIngredientAllergenConfirmation(ingredient,
        allergen, 'contains_pos').then(success => {
      handleUpdateResponse(ingredient, allergen, increase, success, ctx);
    });
  } else {
    IngredientsModel.updateIngredientAllergenConfirmation(ingredient,
        allergen, 'contains_neg').then(success => {
      handleUpdateResponse(ingredient, allergen, increase, success, ctx);
    });
  }

  function handleUpdateResponse(ingredient, allergen, increase, success, ctx) {
    if (success) {
      ctx.body = {message: 'ingredient updated'};
    } else {
      const ingredient = {name: ingredient};
      if (increase) {
        ingredient[allergen].contains_pos = 1;
      } else {
        ingredient[allergen].contains_neg = 1;
      }
      IngredientsModel.insert(ingredient).then(sucess => {
        handleInsertResponse(success);
      });
    }
  }

  function handleInsertResponse(success) {
    if (success) {
      ctx.body = {message: 'ingredient inserted'};
    } else {
      ctx.body = {message: 'ingredient not inserted'};
    }
  }
}
