'use strict';

module.exports = {
  postFeedback,
};

const {AllergenNotFoundError} = require('../errors/ingredients_errors.js');
const {HelpUsWrongParameterError, ContainsWrongParameterError}
    = require('../errors/help_us_errors.js');
const log = require('../logger/logger.js').getLog('help_us.js');
const {UnexpectedError} = require('../errors/general_error_handling');
const {Ingredient, increaseIngredientAllergen, decreaseIngredientAllergen, insert}
    = require('../models/ingredient_model.js');
const AsyncLock = require('async-lock');
const lock = new AsyncLock();

async function postFeedback(ctx) {
  if (!ctx.query.ingredient || !ctx.query.allergen || !ctx.query.contains) {
    ctx.throw(new HelpUsWrongParameterError());
  }
  const ingredientQueryParameter = ctx.query.ingredient;
  const allergenQueryParameter = ctx.query.allergen;
  let containsQueryParameter = ctx.query.contains.toLowerCase();
  if (containsQueryParameter !== 'true' && containsQueryParameter !== 'false') {
    ctx.throw(new ContainsWrongParameterError());
  }
  containsQueryParameter = containsQueryParameter === 'true';
  log.debug('Using Queryparameters:', ingredientQueryParameter,
      allergenQueryParameter);
  await lock.acquire('ingredientUpdateRoute', async () => {
    let updateIsSuccessful = false;
    try {
      if (containsQueryParameter) {
        updateIsSuccessful = await increaseIngredientAllergen(
            ingredientQueryParameter, allergenQueryParameter);
      } else {
        updateIsSuccessful = await decreaseIngredientAllergen(
            ingredientQueryParameter, allergenQueryParameter);
      }
    } catch (err) {
      log.error(err);
      console.error(err);
      ctx.throw(new UnexpectedError());
    }
    if (!updateIsSuccessful) {
      const ingredient = new Ingredient(
          {name: ingredientQueryParameter});
      const allergen = ingredient[allergenQueryParameter];
      if (!allergen) {
        ctx.throw(new AllergenNotFoundError(
            {allergen: allergenQueryParameter}));
      }
      if (containsQueryParameter) {
        allergen.contains_pos = 1;
        allergen.contains_percent = 1;
        allergen.contains = true;
      } else {
        allergen.contains_neg = 1;
      }
      try {
        await insert(ingredient);
      } catch (err) {
        log.error(err);
        console.error(err);
        ctx.throw(new UnexpectedError());
      }
    }
  });
  ctx.body = {message: ingredientQueryParameter + ' updated'};
}
