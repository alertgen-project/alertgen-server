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
  const ingredients = RouteUtil.toArray(ctx.query.ingredients);
  const allergens = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', ingredients, allergens);
  // build promises
  const requestPromises = [];
  ingredients.forEach(ingredient => {
    requestPromises.push(requestIngredient(ingredient));
  });
  // dummy-impl requires error handling and db-request
  const ingredientsWithAllergens = [];
  await Promise.all(requestPromises).then(ingredients => {
    ingredients.forEach(dbIngredient => {
      // build one response-object for each ingredient
      const ingredientProperties = {};
      // check for the requested allergens, and form the response
      allergens.forEach(allergen => {
        const allergenProperties = {
          containing: false,
          contains_percent: 0,
        };
        allergenProperties.containing = dbIngredient[allergen].contains;
        allergenProperties.contains_percent = dbIngredient[allergen].contains_percent;
        ingredientProperties[allergen] = allergenProperties;
      });
      // add responseObject to the responseArray
      const ingredientWithAllergen = {};
      ingredientWithAllergen[dbIngredient.name] = ingredientProperties;
      ingredientsWithAllergens.push(ingredientWithAllergen);
    });
  });
  console.log('results', JSON.stringify(ingredientsWithAllergens));
  return ctx.body = JSON.stringify(ingredientsWithAllergens);
}

async function requestIngredient(ingredient) {
  // TODO add find_first to model
  // testquery for db: http://localhost:8080/ingredients?ingredients=DelicousPancakeDough&allergens=gluten
  const response = await IngredientsModel.findByName(ingredient);
  return response[0];
}
