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
  const products = addIngredientDocumentsRequests(productDocuments);
  await resolveIngredientDocumentRequests(products);
  return ctx.body = removeProductsWithAllergens(products,
      allergensQueryParameter, ctx).map(productInformation => {
    return {
      name: productInformation.name, barcode: productInformation.barcode,
    };
  });
}

function removeProductsWithAllergens(products, allergensQueryParameter, ctx) {
  return ctx.body = products.filter(product => {
    let containsAllergen = false;
    for (let [indexOfIngredientDocument, ingredientDocument] of product.ingredientDocuments.entries()) {
      if (!ingredientDocument) ctx.throw(new IngredientNotIndexedError(
          {ingredient: product.ingredients[indexOfIngredientDocument]}));
      for (let allergen of allergensQueryParameter) {
        if (!ingredientDocument[allergen]) ctx.throw(
            new AllergenNotFoundError({allergen}));
        if (ingredientDocument[allergen].contains) containsAllergen = true;
      }
    }
    return !containsAllergen;
  });
}

function addIngredientDocumentsRequests(productDocuments) {
  return productDocuments.map((productDocument) => {
    const {name, barcode, ingredients} = productDocument;
    return {
      name, barcode, ingredients,
      ingredientDocuments: Promise.all(
          productDocument.ingredients.map(findOneIngredientFuzzy)),
    };
  });
}

async function resolveIngredientDocumentRequests(products) {
  for (let product of products) {
    product.ingredientDocuments = await product.ingredientDocuments;
  }
  return products;
}
