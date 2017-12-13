'use strict';

module.exports = {
  containAllergens,
};

const IngredientsModel = require('../models/ingredient_model.js');
const IngredientsErrors = require('../errors/ingredients_errors.js');
const RouteUtil = require('./route_util.js');
const log = require('../logger/logger.js').getLog('ingredients.js');

async function containAllergens(ctx, next) {
  if (!ctx.query.ingredients || !ctx.query.allergens) {
    ctx.throw(new IngredientsErrors.IngredientsWrongParameterError());
  }
  const ingredientsQueryParam = RouteUtil.toArray(ctx.query.ingredients);
  const allergensQueryParam = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', ingredientsQueryParam,
      allergensQueryParam);
  // build promises
  const databaseRequestPromises = [];
  ingredientsQueryParam.forEach(ingredient => {
    databaseRequestPromises.push(requestIngredient(ingredient));
  });
  const responseIngredients = [];
  let ingredientIndex = 0;
  await Promise.all(databaseRequestPromises).then(ingredients => {
    ingredients.forEach(dbIngredient => {
      // build one response-object for each ingredient
      const responseIngredientAttributes = {};
      // check for the requested allergens, and form the response
      allergensQueryParam.forEach(allergen => {
        const responseAllergen = {
          containing: false,
          contains_percent: 0,
        };
        if (!dbIngredient) {
          ctx.throw(new IngredientsErrors.IngredientNotIndexedError(
              {ingredient: ingredientsQueryParam[ingredientIndex]}));
        }
        const dbAllergen = dbIngredient[allergen];
        if (!dbAllergen) {
          ctx.throw(new IngredientsErrors.AllergenNotFoundError);
        }
        responseAllergen.containing = dbAllergen.contains;
        responseAllergen.contains_percent = dbAllergen.contains_percent;
        responseIngredientAttributes[allergen] = responseAllergen;
        ingredientIndex++;
      });
      // add responseObject to the responseArray
      const responseIngredient = {};
      responseIngredient[dbIngredient.name] = responseIngredientAttributes;
      responseIngredients.push(responseIngredient);
    });
  });
  console.log('results', JSON.stringify(responseIngredients));
  return ctx.body = JSON.stringify(responseIngredients);
}

async function requestIngredient(ingredient) {
  // TODO add find_first to model
  // testquery for db: http://localhost:8080/ingredients?ingredients=DelicousPancakeDough&allergens=gluten
  const response = await IngredientsModel.findByName(ingredient);
  return response[0];
}
