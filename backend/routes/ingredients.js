"use strict";

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
  // request data from db
  // form response
  return ctx.body = true;
}
