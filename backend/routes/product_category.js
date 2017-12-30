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
const {AllergenNotFoundError, IngredientNotIndexedError} = require(
    '../errors/ingredients_errors.js');

/**
 * Contains the logic of the /product_category service. Searches
 * for products in the passed category with do not contain passed glutens.
 * @param {Object}ctx koa's context-object. Used for error handling,
 * acquiring query-parameter and sending the response
 * @returns {Promise<any[]>} the response of the query call to the rest-api
 */
async function retrieveProductsWithoutAllergens(ctx) {
  if (!ctx.query.productCategory || !ctx.query.allergens) {
    ctx.throw(new ProductCategoryWrongParameterError());
  }
  const productCategoryQueryParameter = ctx.query.productCategory;
  const allergensQueryParameter = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', productCategoryQueryParameter,
      allergensQueryParameter);
  const productDocuments = await findProductsOfCategory(
      productCategoryQueryParameter);
  if (!productDocuments || productDocuments.length === 0) {
    ctx.throw(new ProductCategoryNotFoundError(
        {category: productCategoryQueryParameter}));
  }
  return ctx.body = removeProductsWithAllergens(
      await resolveIngredientDocumentRequests(
          addIngredientDocumentsRequests(productDocuments)),
      allergensQueryParameter, ctx).map(productInformation => {
    return {
      name: productInformation.name, barcode: productInformation.barcode,
    };
  });
}

/**
 * Removes the products which contain passed allergens from the array
 * @param {Array<Object>} products array with products
 * @param {Array<Object>} allergens allergens which the returned products should not contain
 * @param {Object} ctx koa's ctx object for handling errors
 * @returns {Array<Object>} an array without products which contain passed allergens
 */
function removeProductsWithAllergens(products, allergens, ctx) {
  return ctx.body = products.filter(product => {
    let containsAllergen = false;
    for (let [indexOfIngredientDocument, ingredientDocument] of product.ingredientDocuments.entries()) {
      if (!ingredientDocument) ctx.throw(new IngredientNotIndexedError(
          {ingredient: product.ingredients[indexOfIngredientDocument]}));
      for (let allergen of allergens) {
        if (!ingredientDocument[allergen]) ctx.throw(
            new AllergenNotFoundError({allergen}));
        if (ingredientDocument[allergen].contains) containsAllergen = true;
      }
    }
    return !containsAllergen;
  });
}

/**
 * Adds to the producDocuments in the passed array a field ingredientDocuments
 * which contains the requested documents from the database
 * @param {Array<Object>} productDocuments the productDocuments to add requests to
 * @param {string} productDocuments.name name of the product
 * @param {string} productDocuments.barcode barcode of the product
 * @param {Array} productDocuments.ingredients names of the ingredients which are in the product
 * @param {Array} productDocuments.ingredientDocuments requests of ingredientdocuments which are still resolving
 * @returns {Array<Object>} array with productDocuments where document has multiple ingredient-requests to resolve
 */
function addIngredientDocumentsRequests(productDocuments) {
  return productDocuments.map((productDocument) => {
    const {name, barcode} = productDocument;
    return {
      name, barcode,
      ingredientDocuments: Promise.all(
          productDocument.ingredients.map(findOneIngredientFuzzy)),
    };
  });
}

/**
 * Resolves the ingredientDocumentRequests in the passed array with products
 * @param {Array<Object>} products with the ingredientsDocuments to resolve
 * @returns {Promise<Object>} Promise to resolve the ingredientDocumentRequests
 */
async function resolveIngredientDocumentRequests(products) {
  for (let product of products) {
    product.ingredientDocuments = await product.ingredientDocuments;
  }
  return products;
}
