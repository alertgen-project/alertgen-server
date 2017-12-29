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

async function isAllergicToProduct(ctx) {
  if (!ctx.query.product || !ctx.query.allergens) {
    ctx.throw(new ProductErrors.ProductWrongParameterError);
  }
  const product = ctx.query.product;
  const allergens = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', product, allergens);
  // checking if allergens in the request are valid
  await Promise.all(allergens.map(async (allergen)=>{
    if (!allergensArr.includes(allergen)) {
      log.error('Invalid allergen in request: '+ allergen);
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
  catch(err) {
    log.error(err);
    ctx.throw(err);
  }
}

async function checkContainingAllergen(productFromDb, allergens, ctx) {
  if (productFromDb === null || productFromDb === undefined) {
    ctx.throw(new ProductErrors.ProductNotFoundError);
  }
  let result = {barcode: productFromDb.barcode};
  let all = false;
  let detail = {};
  const ingredients = productFromDb.ingredients;
  const ingredientsFromDb = [];
  await Promise.all(ingredients.map(async (ingredient) => {
    ingredientsFromDb.push(await findOneIngredientFuzzy(ingredient));
  }));
  await Promise.all(ingredientsFromDb.map(async (ingredient) => {
    await Promise.all(allergens.map(async (allergen)=>{
      if (ingredient[allergen].contains === true) {
        all = true;
        detail[allergen] = true;
      }
      else detail[allergen] = detail[allergen] === true;
    }));
  }));
  result.all = all;
  result.detail = detail;
  return result;
}