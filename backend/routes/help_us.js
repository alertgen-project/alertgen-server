'use strict';

module.exports = {
  postFeedback,
};

const IngredientErrors = require('../errors/ingredients_errors.js');
const HelpUsErrors = require('../errors/help_us_errors.js');
const log = require('../logger/logger.js').getLog('help_us.js');
const IngredientsModel = require('../models/ingredient_model.js');
const UnexpectedError = require(
    '../errors/general_error_handling').DBConnectionFailedError;

async function postFeedback(ctx) {
  if (!ctx.query.ingredient || !ctx.query.allergen || !ctx.query.increase) {
    ctx.throw(new HelpUsErrors.HelpUsWrongParameterError());
  }
  const ingredientQueryParameter = ctx.query.ingredient;
  const allergenQueryParameter = ctx.query.allergen;
  let increaseQueryParameter = ctx.query.increase.toLowerCase();
  if (increaseQueryParameter !== 'true' && increaseQueryParameter !== 'false') {
    ctx.throw(new HelpUsErrors.IncreaseWrongParameterError());
  }
  increaseQueryParameter = ctx.query.increase === 'true';
  log.debug('Using Queryparameters:', ingredientQueryParameter,
      allergenQueryParameter);
  let updateIsSuccessful = false;
  try {
    if (increaseQueryParameter) {
      updateIsSuccessful = await IngredientsModel.increaseIngredientAllergen(
          ingredientQueryParameter, allergenQueryParameter);
    } else {
      updateIsSuccessful = await IngredientsModel.decreaseIngredientAllergen(
          ingredientQueryParameter, allergenQueryParameter);
    }
  } catch (err) {
    log.error(err);
    console.error(err);
    ctx.throw(new UnexpectedError());
  }
  if (!updateIsSuccessful) {
    const ingredient = new IngredientsModel.Ingredient(
        {name: ingredientQueryParameter});
    const allergen = ingredient[allergenQueryParameter];
    if (!allergen) {
      ctx.throw(new IngredientErrors.AllergenNotFoundError(
          {allergen: ingredientQueryParameter}));
    }
    if (increaseQueryParameter) {
      allergen.contains_pos = 1;
    } else {
      allergen.contains_neg = 1;
    }
    try {
      await IngredientsModel.insert(ingredient);
    } catch (err) {
      log.error(err);
      console.error(err);
      ctx.throw(new UnexpectedError());
    }
  }
  ctx.body = {message: ingredientQueryParameter + ' updated'};
}
