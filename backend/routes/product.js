'use strict';

module.exports = {
  isAllergicToProduct,
};

const RouteUtil = require('./route_util.js');
const ProductErrors = require('../errors/product_errors.js');
const {findOneByBarcode, findOne} = require('../models/product_model');
const {findOneIngredientFuzzy} = require('../models/ingredient_model');
const allergensArr = require('../models/ingredient_model').allergens;
const log = require('../logger/logger.js').getLog('product.js');

/**
 * logic of /product route
 * The requested product and allergens are saved to constants.
 * the validation of the allergens array is checked
 * depending on whether if it's a numeric or a character string the checkContainingAllergen
 * function is called with findOneByBarcode() or findOne()
 * @param {Object} ctx - Koa context object
 * @returns {Promise<*>} - returns response body
 */
async function isAllergicToProduct(ctx) {
  if (!ctx.query.product || !ctx.query.allergens) ctx.throw(
      new ProductErrors.ProductWrongParameterError);
  const product = ctx.query.product;
  const allergens = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', product, allergens);
  // checking if allergens in the request are valid
  await Promise.all(allergens.map(async (allergen) => {
    if (!allergensArr.includes(allergen)) {
      log.error('Invalid allergen in request: ' + allergen);
      ctx.throw(new ProductErrors.InvalidAllergen);
    }
  }));
  // request data from db
  try {
    if (product.match('[0-9]+') && product.length > 5) {
      ctx.body = await checkContainingAllergen(await findOneByBarcode(product),
          allergens, ctx);
      return ctx.body;
    }
    else {
      ctx.body = await checkContainingAllergen(await findOne({name: product}),
          allergens, ctx);
      return ctx.body;
    }
  }
  catch (err) {
    log.error({err: err});
    ctx.throw(err);
  }
}

/**
 * function iterates through the requested allergens and checks if these are included in the product
 * it creates and returns a result object which is in fact the response body of the route
 * the ctx parameter is used to throw an ProductNotFoundError if the requested product wasn't found in the database
 * @param {Object} productFromDb - the product loaded from database
 * @param {string[]} allergens - array of allergens from request
 * @param {Object} ctx - Koa context object
 * @returns {Promise<{barcode: *|string|barcode|{type, required, unique}}>}
 */
async function checkContainingAllergen(productFromDb, allergens, ctx) {
  if (productFromDb === null || productFromDb === undefined) {
    ctx.throw(new ProductErrors.ProductNotFoundError);
  }
  let result = {barcode: productFromDb.barcode};
  let all = false;
  let detail = {};
  const ingredients = productFromDb.ingredients;
  let ingredientsFromDb = await Promise.all(ingredients.map((ingredient) => {
    return findOneIngredientFuzzy(ingredient);
  }));
  ingredientsFromDb.forEach((ingredient) => {
    allergens.forEach((allergen) => {
      if (ingredient[allergen].contains === true) {
        all = true;
        detail[allergen] = true;
      }
      else detail[allergen] = detail[allergen] === true;
    });
  });
  result.all = all;
  result.detail = detail;
  return result;
}