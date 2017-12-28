'use strict';

module.exports = {
  retrieveProductsWithoutAllergens,
};

const RouteUtil = require('./route_util.js');
const {
  ProductCategoryWrongParameterError,
  ProductCategoryNotFoundError,
} = require('../errors/product_category_errors.js');
const log = require('../logger/logger.js').getLog('product_category.js');
const {findProductsOfCategory} = require('../models/product_model.js');
const {findOneIngredientFuzzy} = require('../models/ingredient_model.js');
const {AllergenNotFoundError} = require('../errors/ingredients_errors.js');

async function retrieveProductsWithoutAllergens(ctx) {
  if (!ctx.query.productCategory || !ctx.query.allergens) {
    ctx.throw(new ProductCategoryWrongParameterError());
  }
  const productCategoryQueryParameter = ctx.query.productCategory;
  const allergensQueryParameter = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', productCategoryQueryParameter,
      allergensQueryParameter);
  const productsWithoutAllergens = [];
  const products = await findProductsOfCategory(productCategoryQueryParameter);
  if(!products ||products.length == 0){
    ctx.throw(new ProductCategoryNotFoundError({category: productCategoryQueryParameter}));
  }
  for (let product of products) {
    let containsAllergen = false;
    for (let ingredientName of product.ingredients) {
      const ingredientDocument = await findOneIngredientFuzzy(ingredientName);
      for (let allergen of allergensQueryParameter) {
        if (!ingredientDocument[allergen]) {
          ctx.throw(new AllergenNotFoundError({allergen}));
        }
        if (ingredientDocument[allergen].contains) {
          containsAllergen = true;
        }
      }
    }
    if (!containsAllergen) {
      productsWithoutAllergens.push(
          {productName: product.name, barcode: product.barcode});
    }
  }
  return ctx.body = productsWithoutAllergens;
}
