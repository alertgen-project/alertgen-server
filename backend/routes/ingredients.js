'use strict';

module.exports = {
  containAllergens,
};

const {findOneIngredientFuzzy} = require('../models/ingredient_model.js');
const IngredientsErrors = require('../errors/ingredients_errors.js');
const RouteUtil = require('./route_util.js');
const log = require('../logger/logger.js').getLog('ingredients.js');

async function containAllergens(ctx) {
  if (!ctx.query.ingredients || !ctx.query.allergens) {
    ctx.throw(new IngredientsErrors.IngredientsWrongParameterError());
  }
  const ingredientsQueryParameter = RouteUtil.toArray(ctx.query.ingredients);
  const allergensQueryParameter = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', ingredientsQueryParameter,
      allergensQueryParameter);
  const responseIngredients = await Promise.all(
      ingredientsQueryParameter.map(findOneIngredientFuzzy)).
      then((dbIngredients) => {
        return dbIngredients.map((dbIngredient, ingredientIndex) => {
          if (!dbIngredient) {
            ctx.throw(new IngredientsErrors.IngredientNotIndexedError(
                {ingredient: ingredientsQueryParameter[ingredientIndex]}));
          }
          // create an object which contains all requested allergens for this ingredient
          const responseAllergens = allergensQueryParameter.reduce(
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
