'use strict';

module.exports = {
  containAllergens,
};

const IngredientsModel = require('../models/ingredient_model.js');
const IngredientsErrors = require('../errors/ingredients_errors.js');
const RouteUtil = require('./route_util.js');
const log = require('../logger/logger.js').getLog('ingredients.js');

async function containAllergens(ctx) {
  if (!ctx.query.ingredients || !ctx.query.allergens) {
    ctx.throw(new IngredientsErrors.IngredientsWrongParameterError());
  }
  const ingredientsQueryParam = RouteUtil.toArray(ctx.query.ingredients);
  const allergensQueryParam = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', ingredientsQueryParam,
      allergensQueryParam);
  const responseIngredients = await Promise.all(
      ingredientsQueryParam.map(requestIngredient)).
      then(dbIngredients => {
        return dbIngredients.map((dbIngredient, ingredientIndex) => {
          if (!dbIngredient) {
            ctx.throw(new IngredientsErrors.IngredientNotIndexedError(
                {ingredient: ingredientsQueryParam[ingredientIndex]}));
          }
          // create an object which contains all requested allergens for this ingredient
          const responseAllergens = allergensQueryParam.reduce(
              (responseAllergens, allergen) => {
                const dbAllergen = dbIngredient[allergen];
                if (!dbAllergen) {
                  ctx.throw(
                      new IngredientsErrors.AllergenNotFoundError({allergen}));
                }
                const {contains, contains_percent} = dbAllergen;
                responseAllergens[allergen] = {
                  containing: contains, contains_percent,
                };
                return responseAllergens;
              }, {});
          return {[`${dbIngredient.name}`]: responseAllergens};
        });
      });
  return ctx.body = responseIngredients;
}

async function requestIngredient(ingredient) {
  /**
   * Returns the first found Ingredient in the database with the passed name
   */
      // testquery for db: http://localhost:8080/ingredients?ingredients=DelicousPancakeDough&allergens=gluten
      // testquery for two ingredients http://localhost:8080/ingredients?ingredients=DelicousPancakeDough&ingredients=DelicousPickle&allergens=gluten
      // testquery for two allergens http://localhost:8080/ingredients?ingredients=DelicousPickle2&allergens=gluten&allergens=lupin
  const response = await IngredientsModel.findByName(ingredient);
  return response[0];
}
