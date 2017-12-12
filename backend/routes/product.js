"use strict";

module.exports = {
  isAllergicToProduct,
};

const RouteUtil = require('./route_util.js');
const ProductErrors = require('../errors/product_errors.js');

const log = require('../logger/logger.js').getLog('product.js');

async function isAllergicToProduct(ctx, next) {
  if (!ctx.query.product || !ctx.query.allergens) {
    ctx.throw(new ProductErrors.ProductWrongParameterError);
  }
  const product = ctx.query.product;
  const allergens = RouteUtil.toArray(ctx.query.allergens);
  log.debug('Using Queryparameters:', product, allergens);
  // request data from db
  // form response
  ctx.body = true;
}
