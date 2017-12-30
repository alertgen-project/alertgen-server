'use strict';

module.exports = {
  containAllergens,
};

const {findOneIngredientFuzzy} = require('../models/ingredient_model.js');
const IngredientsErrors = require('../errors/ingredients_errors.js');
const RouteUtil = require('./route_util.js');
const log = require('../logger/logger.js').getLog('ingredients.js');

/**
 * Responds with allergendata about the requested ingredients.
 * Only responds with data about the requested allergens.
 * @param ctx koa's context-object. Used for error handling,
 * acquiring query-parameter and sending the response
 * @returns {Promise<any[]>} promise handled by koa
 */
async function containAllergens(ctx) {
  if (!ctx.query.ingredients || !ctx.query.allergens) {
    ctx.throw(new IngredientsErrors.IngredientsWrongParameterError());
  }
  const ingredientsQueryParameter = RouteUtil.toArray(ctx.query.ingredients);
  const allergensQueryParameter = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', ingredientsQueryParameter,
      allergensQueryParameter);
  return ctx.body = (await Promise.all(
      ingredientsQueryParameter.map(findOneIngredientFuzzy))).map(
      (ingredientDocument, indexOfIngredientDocument) => {
        if (!ingredientDocument)
          ctx.throw(new IngredientsErrors.IngredientNotIndexedError(
              {ingredient: ingredientsQueryParameter[indexOfIngredientDocument]}));
        return {
          [`${ingredientDocument.name}`]: createResponseAllergens(
              allergensQueryParameter, ingredientDocument, ctx),
        };
      });
}

/**
 * Creates an Object which contains the requested allergens for the passed ingredientDocument
 * @param {Array<string>} allergensQueryParameters array of requested allergens
 * @param {Object} ingredientDocument document with the ingredientdata
 * @param {Object} ctx koa's context-object. Used for error handling.
 * @returns {Object} an Object which contains the requested allergens for the passed ingredientDocument
 */
function createResponseAllergens(allergensQueryParameters, ingredientDocument, ctx) {
  return allergensQueryParameters.reduce(
      (responseAllergens, allergenQueryParameter) => {
        const indexedAllergen = ingredientDocument[allergenQueryParameter];
        if (!indexedAllergen)
          ctx.throw(
              new IngredientsErrors.AllergenNotFoundError(
                  {allergen: allergenQueryParameter}));
        const {contains, contains_percent} = indexedAllergen;
        responseAllergens[allergenQueryParameter] = {
          containing: contains, contains_percent,
        };
        return responseAllergens;
      }, {});
}
