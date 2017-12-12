"use strict";

module.exports = {
  retrieveProductsWithoutAllergens,
};

const RouteUtil = require('./route_util.js');
const ProductCategoryErrors = require('../errors/product_category_errors.js');
const log = require('../logger/logger.js').getLog('product_category.js');

async function retrieveProductsWithoutAllergens(ctx, next) {
  if (!ctx.query.productCategory || !ctx.query.allergens) {
    ctx.throw(new ProductCategoryErrors.ProductCategoryWrongParameterError());
  }
  const productCategory = ctx.query.productCategory;
  const allergens = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', productCategory, allergens);
  // request data from db
  // form response
  return ctx.body = true;
}
