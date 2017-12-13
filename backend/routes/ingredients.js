'use strict';

module.exports = {
  containAllergens,
};

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
    requestPromises.push(requestIngredientDummy(ingredient));
  });
  // dummy-impl requires error handling and db-request
  const ingredientsWithAllergens = [];
  await Promise.all(requestPromises).then(ingredients => {
    ingredients.forEach(ingredient => {
      // skip first level, it contains only the name of the ingredient
      Object.entries(ingredient).
          forEach(([dbIngredientName, dbIngredientAttributes]) => {
            // build one response for each ingredient
            const ingredientProperties = {};
            // check for the requested allergens, and form the response
            allergens.forEach(allergen => {
              const allergenProperties = {
                containing: false,
                contains_percent: 0,
              };
              if (dbIngredientAttributes[allergen].contains) {
                allergenProperties.containing = true;
              }
              allergenProperties.contains_percent = dbIngredientAttributes[allergen].contains_percent;
              ingredientProperties[allergen] = allergenProperties;
            });
            // add responseObject to the responseArray
            const ingredientWithAllergen = {};
            ingredientWithAllergen[dbIngredientName] = ingredientProperties;
            ingredientsWithAllergens.push(ingredientWithAllergen);
          });
    });
  });
  console.log('results', JSON.stringify(ingredientsWithAllergens));
  return ctx.body = JSON.stringify(ingredientsWithAllergens);
}

async function requestIngredientDummy(ingredient) {
  // call mongodb dummy
  // testquery http://localhost:8080/ingredients?ingredients=anything&allergens=gluten
  return {
    DelicousPancakeDough: {
      gluten: {
        contains: true,
        contains_percent: 0.8,
      },
    },
  };
}
