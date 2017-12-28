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
      then((ingredientsDocuments) => {
        return ingredientsDocuments.map((ingredientDocument, indexOfIngredientDocument) => {
          if (!ingredientDocument) {
            ctx.throw(new IngredientsErrors.IngredientNotIndexedError(
                {ingredient: ingredientsQueryParameter[indexOfIngredientDocument]}));
          }
          // create an object which contains all requested allergens for this ingredient
          const responseAllergens = allergensQueryParameter.reduce(
              (responseAllergens, allergenQueryParameter) => {
                const indexedAllergen = ingredientDocument[allergenQueryParameter];
                if (!indexedAllergen) {
                  ctx.throw(
                      new IngredientsErrors.AllergenNotFoundError({allergen: allergenQueryParameter}));
                }
                const {contains, contains_percent} = indexedAllergen;
                responseAllergens[allergenQueryParameter] = {
                  containing: contains, contains_percent,
                };
                return responseAllergens;
              }, {});
          return {[`${ingredientDocument.name}`]: responseAllergens};
        });
      });
  return ctx.body = responseIngredients;
}
